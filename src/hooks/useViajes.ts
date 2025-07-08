
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { Viaje } from '@/types/viaje';

// Cache global con TTL para prevenir duplicaciones
const viajesCache = new Map<string, { timestamp: number; processing: boolean }>();
const CACHE_TTL = 30000; // 30 segundos

function generarViajeSignature(wizardData: ViajeWizardData): string {
  return [
    wizardData.cliente?.rfc || '',
    wizardData.origen?.domicilio?.calle || '',
    wizardData.destino?.domicilio?.calle || '',
    wizardData.vehiculo?.id || '',
    wizardData.conductor?.id || '',
    // Usar fecha redondeada para evitar duplicados por clicks rápidos
    Math.floor(Date.now() / 60000).toString() // Agrupa por minutos
  ].join('|');
}

function isViajeInProgress(signature: string): boolean {
  const cached = viajesCache.get(signature);
  if (!cached) return false;
  
  // Verificar si expiró el cache
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    viajesCache.delete(signature);
    return false;
  }
  
  return cached.processing;
}

function markViajeAsProcessing(signature: string) {
  viajesCache.set(signature, {
    timestamp: Date.now(),
    processing: true
  });
}

function markViajeAsCompleted(signature: string) {
  const cached = viajesCache.get(signature);
  if (cached) {
    cached.processing = false;
  }
}

export const useViajes = () => {
  const queryClient = useQueryClient();
  const [isCreatingViaje, setIsCreatingViaje] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  // Obtener todos los viajes (excluyendo borradores)
  const { data: viajes = [], isLoading } = useQuery({
    queryKey: ['viajes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .neq('estado', 'borrador') // Excluir borradores de la lista principal
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Viaje[];
    }
  });

  // Obtener borrador activo del usuario
  const { data: borradorActivo, isLoading: loadingBorrador } = useQuery({
    queryKey: ['borrador-activo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .eq('estado', 'borrador')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Viaje | null;
    }
  });

  // Crear viaje desde wizard - VERSIÓN CORREGIDA QUE RETORNA PROMISE
  const crearViaje = async (wizardData: ViajeWizardData): Promise<Viaje> => {
    console.log('🚀 Iniciando creación de viaje:', wizardData);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Validaciones básicas
    if (!wizardData.cliente) {
      throw new Error('Cliente es requerido');
    }
    if (!wizardData.origen || !wizardData.destino) {
      throw new Error('Origen y destino son requeridos');
    }

    // Generar signature única para este viaje
    const viajeSignature = generarViajeSignature(wizardData);
    
    console.log('🔒 Verificando duplicados para signature:', viajeSignature);
    
    // Verificar cache local
    if (isViajeInProgress(viajeSignature)) {
      throw new Error('Este viaje ya está siendo procesado. Por favor espera unos segundos.');
    }

    // Marcar como en proceso
    markViajeAsProcessing(viajeSignature);
    setIsCreatingViaje(true);

    try {
      // Verificar duplicados en base de datos (últimos 2 minutos)
      const dosMinutosAtras = new Date(Date.now() - 120000).toISOString();
      
      const { data: viajesRecientes, error: errorConsulta } = await supabase
        .from('viajes')
        .select('id, tracking_data, created_at')
        .eq('user_id', user.id)
        .gte('created_at', dosMinutosAtras)
        .order('created_at', { ascending: false })
        .limit(10);

      if (errorConsulta) {
        console.warn('⚠️ Error consultando viajes existentes:', errorConsulta);
      }

      // Verificar duplicados exactos en tracking_data
      if (viajesRecientes && viajesRecientes.length > 0) {
        for (const viajeExistente of viajesRecientes) {
          const trackingExistente = viajeExistente.tracking_data as any;
          if (trackingExistente && 
              typeof trackingExistente === 'object' &&
              trackingExistente.cliente?.rfc === wizardData.cliente?.rfc &&
              trackingExistente.origen?.domicilio?.calle === wizardData.origen?.domicilio?.calle &&
              trackingExistente.destino?.domicilio?.calle === wizardData.destino?.domicilio?.calle) {
            
            console.log('🔍 Viaje duplicado detectado:', viajeExistente.id);
            throw new Error(`Ya existe un viaje similar creado hace ${Math.round((Date.now() - new Date(viajeExistente.created_at).getTime()) / 1000)} segundos. Revisa la lista de viajes.`);
          }
        }
      }

      // Crear nuevo viaje con ID único
      const viajeId = `viaje-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const viajeData = {
        id: viajeId,
        carta_porte_id: `CP-${Date.now()}`,
        origen: wizardData.origen?.domicilio?.calle || '',
        destino: wizardData.destino?.domicilio?.calle || '',
        conductor_id: wizardData.conductor?.id,
        vehiculo_id: wizardData.vehiculo?.id,
        estado: 'programado' as const,
        fecha_inicio_programada: wizardData.origen?.fechaHoraSalidaLlegada || new Date().toISOString(),
        fecha_fin_programada: wizardData.destino?.fechaHoraSalidaLlegada || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        observaciones: `Viaje ${wizardData.cliente?.nombre_razon_social || 'Sin cliente'} - Distancia: ${wizardData.distanciaRecorrida || 0} km`,
        tracking_data: JSON.parse(JSON.stringify(wizardData)),
        user_id: user.id
      };

      console.log('💾 Creando nuevo viaje:', viajeData.origen, '->', viajeData.destino);

      const { data, error } = await supabase
        .from('viajes')
        .insert(viajeData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error insertando viaje:', error);
        throw error;
      }

      console.log('✅ Viaje creado exitosamente:', data.id);
      
      // Invalidar cache de queries
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      
      // Mostrar toast de éxito
      toast.success(`Viaje creado exitosamente: ${data.origen} → ${data.destino}`);
      
      return data as Viaje;

    } finally {
      // Marcar como completado y limpiar después de un tiempo
      markViajeAsCompleted(viajeSignature);
      setIsCreatingViaje(false);
      
      setTimeout(() => {
        viajesCache.delete(viajeSignature);
      }, CACHE_TTL);
    }
  };

  // Guardar borrador de viaje - MEJORADO
  const guardarBorradorViaje = async (wizardData: ViajeWizardData, borradorId?: string): Promise<Viaje> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const viajeId = borradorId || `viaje-draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const viajeData = {
      id: viajeId,
      carta_porte_id: `DRAFT-${Date.now()}`,
      origen: wizardData.origen?.domicilio?.calle || 'Origen por definir',
      destino: wizardData.destino?.domicilio?.calle || 'Destino por definir',
      conductor_id: wizardData.conductor?.id,
      vehiculo_id: wizardData.vehiculo?.id,
      estado: 'borrador' as const,
      fecha_inicio_programada: wizardData.origen?.fechaHoraSalidaLlegada || new Date().toISOString(),
      fecha_fin_programada: wizardData.destino?.fechaHoraSalidaLlegada || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      observaciones: `Borrador - ${wizardData.cliente?.nombre_razon_social || 'Viaje en progreso'}`,
      tracking_data: JSON.parse(JSON.stringify(wizardData)),
      user_id: user.id
    };

    if (borradorId) {
      const { data, error } = await supabase
        .from('viajes')
        .update(viajeData)
        .eq('id', borradorId)
        .select()
        .single();
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['borrador-activo'] });
      setCurrentDraftId(data.id);
      toast.success('Borrador guardado exitosamente');
      return data as Viaje;
    }

    const { data, error } = await supabase
      .from('viajes')
      .insert(viajeData)
      .select()
      .single();

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['borrador-activo'] });
    setCurrentDraftId(data.id);
    toast.success('Borrador guardado exitosamente');
    return data as Viaje;
  };

  // Cargar borrador - NUEVO
  const cargarBorrador = async (borradorId: string): Promise<ViajeWizardData | null> => {
    try {
      const { data, error } = await supabase
        .from('viajes')
        .select('tracking_data')
        .eq('id', borradorId)
        .eq('estado', 'borrador')
        .single();

      if (error) throw error;
      
      // Safe type conversion with proper error handling
      const trackingData = data.tracking_data;
      if (trackingData && typeof trackingData === 'object' && !Array.isArray(trackingData)) {
        return trackingData as unknown as ViajeWizardData;
      }
      
      console.warn('Invalid tracking_data format:', trackingData);
      return null;
    } catch (error) {
      console.error('Error cargando borrador:', error);
      return null;
    }
  };

  // Eliminar borrador - NUEVO
  const eliminarBorrador = async (borradorId: string): Promise<void> => {
    const { error } = await supabase
      .from('viajes')
      .delete()
      .eq('id', borradorId)
      .eq('estado', 'borrador');
    
    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['borrador-activo'] });
    setCurrentDraftId(null);
    toast.success('Borrador eliminado');
  };

  // Convertir borrador a viaje - NUEVO
  const convertirBorradorAViaje = async (borradorId: string): Promise<Viaje> => {
    const { data, error } = await supabase
      .from('viajes')
      .update({ 
        estado: 'programado',
        carta_porte_id: `CP-${Date.now()}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', borradorId)
      .eq('estado', 'borrador')
      .select()
      .single();

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['viajes'] });
    queryClient.invalidateQueries({ queryKey: ['borrador-activo'] });
    setCurrentDraftId(null);
    toast.success(`Viaje programado exitosamente: ${data.origen} → ${data.destino}`);
    
    return data as Viaje;
  };

  // Actualizar estado del viaje
  const actualizarViaje = async (id: string, updates: Partial<Viaje>): Promise<Viaje> => {
    const { data, error } = await supabase
      .from('viajes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['viajes'] });
    return data as Viaje;
  };

  // Cancelar viaje
  const cancelarViaje = async (id: string): Promise<Viaje> => {
    const { data, error } = await supabase
      .from('viajes')
      .update({ estado: 'cancelado' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['viajes'] });
    toast.success('Viaje cancelado');
    return data as Viaje;
  };

  // Eliminar viaje
  const eliminarViaje = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('viajes')
      .delete()
      .eq('id', id);
    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['viajes'] });
    toast.success('Viaje eliminado');
  };

  return {
    // Datos
    viajes,
    isLoading,
    borradorActivo,
    loadingBorrador,
    currentDraftId,
    
    // Funciones principales
    crearViaje, // Ahora retorna Promise directamente
    isCreatingViaje,
    actualizarViaje,
    cancelarViaje,
    eliminarViaje,
    
    // Funciones de borrador
    guardarBorradorViaje,
    cargarBorrador,
    eliminarBorrador,
    convertirBorradorAViaje,
    
    // Control de estado
    setCurrentDraftId
  };
};

// Export the Viaje type
export type { Viaje };
