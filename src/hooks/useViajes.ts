
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';

export interface Viaje {
  id: string;
  carta_porte_id: string;
  origen: string;
  destino: string;
  conductor_id?: string;
  vehiculo_id?: string;
  estado: 'programado' | 'en_transito' | 'completado' | 'cancelado' | 'retrasado';
  fecha_inicio_programada: string;
  fecha_inicio_real?: string;
  fecha_fin_programada: string;
  fecha_fin_real?: string;
  observaciones?: string;
  tracking_data?: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

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

  // Obtener todos los viajes
  const { data: viajes = [], isLoading } = useQuery({
    queryKey: ['viajes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Viaje[];
    }
  });

  // Crear viaje desde wizard - VERSIÓN ANTI-DUPLICACIÓN MEJORADA
  const crearViaje = useMutation({
    mutationFn: async (wizardData: ViajeWizardData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

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
        return data as Viaje;

      } finally {
        // Marcar como completado y limpiar después de un tiempo
        markViajeAsCompleted(viajeSignature);
        setIsCreatingViaje(false);
        
        setTimeout(() => {
          viajesCache.delete(viajeSignature);
        }, CACHE_TTL);
      }
    },
    onSuccess: (viaje) => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      toast.success(`Viaje creado exitosamente: ${viaje.origen} → ${viaje.destino}`);
    },
    onError: (error) => {
      console.error('❌ Error creando viaje:', error);
      toast.error(error.message || 'Error al crear el viaje');
      setIsCreatingViaje(false);
    }
  });

  // Actualizar estado del viaje
  const actualizarViaje = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Viaje> }) => {
      const { data, error } = await supabase
        .from('viajes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Viaje;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    }
  });

  return {
    viajes,
    isLoading,
    crearViaje: crearViaje.mutate,
    isCreatingViaje: isCreatingViaje || crearViaje.isPending,
    actualizarViaje: actualizarViaje.mutate,
    isUpdatingViaje: actualizarViaje.isPending
  };
};
