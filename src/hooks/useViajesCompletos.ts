
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ViajeCompleto {
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
  // Datos del conductor con nombres reales
  conductor?: {
    id: string;
    nombre: string;
    telefono?: string;
    tipo_licencia?: string;
    email?: string;
  };
  // Datos del vehículo con información real
  vehiculo?: {
    id: string;
    marca: string;
    modelo: string;
    placa: string;
    tipo_carroceria?: string;
    capacidad_carga?: number;
    anio?: number;
    // Remolque asociado REAL
    remolque?: {
      id: string;
      placa: string;
      subtipo_rem: string;
      capacidad_adicional?: number;
    };
  };
  // Datos de mercancías extraídas del tracking_data
  mercancias?: {
    id: string;
    descripcion: string;
    cantidad: number;
    peso_kg: number;
    valor_total?: number;
    tipo_embalaje?: string;
  }[];
  // Cliente/receptor
  cliente?: {
    nombre: string;
    rfc: string;
    direccion?: string;
  };
  // Información de la carta porte
  carta_porte?: {
    id: string;
    folio?: string;
    uuid_fiscal?: string;
    status: string;
    xml_generado?: string;
    fecha_timbrado?: string;
  };
}

export const useViajesCompletos = () => {
  const queryClient = useQueryClient();

  // Obtener viajes con información completa usando joins reales con remolques
  const { data: viajes = [], isLoading, error } = useQuery({
    queryKey: ['viajes-completos'],
    queryFn: async () => {
      console.log('🚛 Obteniendo viajes con información completa desde BD...');
      
      const { data, error } = await supabase
        .from('viajes')
        .select(`
          *,
          conductor:conductores(
            id, 
            nombre, 
            telefono, 
            tipo_licencia, 
            email,
            rfc
          ),
          vehiculo:vehiculos(
            id, 
            marca, 
            modelo, 
            placa, 
            tipo_carroceria, 
            capacidad_carga,
            anio,
            peso_bruto_vehicular
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo viajes:', error);
        throw error;
      }

      console.log(`📊 ${data?.length || 0} viajes obtenidos desde BD`);

      // Enriquecer con datos reales de remolques y eliminar datos estáticos
      const viajesEnriquecidos = await Promise.all(data?.map(async (viaje) => {
        let trackingData: any = {};
        let mercancias: any[] = [];
        let cliente: any = null;
        
        // Parsear tracking_data de forma segura
        if (typeof viaje.tracking_data === 'string') {
          try {
            trackingData = JSON.parse(viaje.tracking_data);
          } catch (e) {
            console.warn('⚠️ Error parsing tracking_data:', e);
            trackingData = {};
          }
        } else if (viaje.tracking_data && typeof viaje.tracking_data === 'object') {
          trackingData = viaje.tracking_data;
        }

        // Obtener remolque REAL asociado al vehículo
        let remolqueReal = null;
        if (viaje.vehiculo?.id) {
          const { data: remolqueData } = await supabase
            .from('remolques_ccp')
            .select('*')
            .eq('autotransporte_id', viaje.vehiculo.id)
            .single();
          
          if (remolqueData) {
            remolqueReal = {
              id: remolqueData.id,
              placa: remolqueData.placa,
              subtipo_rem: remolqueData.subtipo_rem,
              capacidad_adicional: 0 // Se puede agregar este campo a la BD
            };
          }
        }
        
        // Extraer mercancías REALES de la BD
        if (viaje.carta_porte_id) {
          const { data: mercanciasData } = await supabase
            .from('mercancias')
            .select('*')
            .eq('carta_porte_id', viaje.carta_porte_id);
          
          if (mercanciasData && mercanciasData.length > 0) {
            mercancias = mercanciasData.map((m: any) => ({
              id: m.id,
              descripcion: m.descripcion || 'Sin descripción',
              cantidad: m.cantidad || 0,
              peso_kg: m.peso_kg || 0,
              valor_total: m.valor_mercancia || 0,
              tipo_embalaje: m.tipo_embalaje || 'N/A'
            }));
          }
        }

        // Extraer cliente REAL
        if (trackingData.cliente) {
          cliente = {
            nombre: trackingData.cliente.nombre || 'Cliente no especificado',
            rfc: trackingData.cliente.rfc || '',
            direccion: trackingData.cliente.direccion || ''
          };
        }

        // Obtener información REAL de la carta porte
        let carta_porte = {
          id: viaje.carta_porte_id || '',
          folio: '',
          uuid_fiscal: '',
          status: 'borrador',
          xml_generado: '',
          fecha_timbrado: ''
        };

        if (viaje.carta_porte_id) {
          const { data: cartaPorteData } = await supabase
            .from('cartas_porte')
            .select('folio, uuid_fiscal, status, xml_generado, fecha_timbrado')
            .eq('id', viaje.carta_porte_id)
            .single();
          
          if (cartaPorteData) {
            carta_porte = {
              id: viaje.carta_porte_id,
              folio: cartaPorteData.folio || '',
              uuid_fiscal: cartaPorteData.uuid_fiscal || '',
              status: cartaPorteData.status || 'borrador',
              xml_generado: cartaPorteData.xml_generado || '',
              fecha_timbrado: cartaPorteData.fecha_timbrado || ''
            };
          }
        }
        
        return {
          ...viaje,
          mercancias,
          cliente,
          conductor: viaje.conductor,
          vehiculo: viaje.vehiculo ? {
            ...viaje.vehiculo,
            remolque: remolqueReal
          } : null,
          carta_porte
        };
      }) || []);

      console.log('✅ Viajes enriquecidos con datos REALES:', viajesEnriquecidos.length);
      return viajesEnriquecidos as ViajeCompleto[];
    },
    staleTime: 30000, // Cache por 30 segundos
    refetchOnWindowFocus: false
  });

  // Filtrar viajes activos (programado, en_transito, retrasado)
  const viajesActivos = viajes.filter(viaje => 
    ['programado', 'en_transito', 'retrasado'].includes(viaje.estado)
  );

  // Filtrar historial (completado, cancelado)
  const viajesHistorial = viajes.filter(viaje => 
    ['completado', 'cancelado'].includes(viaje.estado)
  );

  // Actualizar estado del viaje con feedback mejorado
  const actualizarEstadoViaje = useMutation({
    mutationFn: async ({ id, nuevoEstado, observaciones }: { 
      id: string; 
      nuevoEstado: string; 
      observaciones?: string 
    }) => {
      console.log(`🔄 Actualizando viaje ${id} a estado: ${nuevoEstado}`);
      
      const updateData: any = { estado: nuevoEstado };
      
      // Lógica de timestamps automática
      if (nuevoEstado === 'en_transito' && !viajes.find(v => v.id === id)?.fecha_inicio_real) {
        updateData.fecha_inicio_real = new Date().toISOString();
        console.log('📅 Marcando fecha de inicio real');
      }
      
      if (nuevoEstado === 'completado') {
        updateData.fecha_fin_real = new Date().toISOString();
        console.log('📅 Marcando fecha de finalización');
      }
      
      if (observaciones) {
        updateData.observaciones = observaciones;
      }

      const { data, error } = await supabase
        .from('viajes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando estado:', error);
        throw error;
      }
      
      console.log('✅ Estado actualizado exitosamente');
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['viajes-completos'] });
      toast.success(`Viaje ${variables.nuevoEstado === 'en_transito' ? 'iniciado' : 
                              variables.nuevoEstado === 'completado' ? 'completado' : 
                              'actualizado'} exitosamente`);
    },
    onError: (error) => {
      console.error('❌ Error actualizando estado:', error);
      toast.error('Error al actualizar el estado del viaje');
    }
  });

  const asignarRecursos = useMutation({
    mutationFn: async ({ 
      viajeId, 
      conductorId, 
      vehiculoId 
    }: { 
      viajeId: string; 
      conductorId?: string; 
      vehiculoId?: string 
    }) => {
      console.log(`🔗 Asignando recursos al viaje ${viajeId}`);
      
      const updates: any = {};
      if (conductorId) {
        updates.conductor_id = conductorId;
        console.log(`👨‍✈️ Asignando conductor: ${conductorId}`);
      }
      if (vehiculoId) {
        updates.vehiculo_id = vehiculoId;
        console.log(`🚛 Asignando vehículo: ${vehiculoId}`);
      }

      const { data, error } = await supabase
        .from('viajes')
        .update(updates)
        .eq('id', viajeId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error asignando recursos:', error);
        throw error;
      }
      
      console.log('✅ Recursos asignados exitosamente');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes-completos'] });
      toast.success('Recursos asignados exitosamente');
    },
    onError: (error) => {
      console.error('❌ Error asignando recursos:', error);
      toast.error('Error al asignar recursos');
    }
  });

  const eliminarViaje = useMutation({
    mutationFn: async (viajeId: string) => {
      console.log(`🗑️ Eliminando viaje: ${viajeId}`);
      
      const { error } = await supabase
        .from('viajes')
        .delete()
        .eq('id', viajeId);

      if (error) {
        console.error('❌ Error eliminando viaje:', error);
        throw error;
      }
      
      console.log('✅ Viaje eliminado exitosamente');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes-completos'] });
      toast.success('Viaje eliminado exitosamente');
    },
    onError: (error) => {
      console.error('❌ Error eliminando viaje:', error);
      toast.error('Error al eliminar el viaje');
    }
  });

  return {
    // Datos REALES de la BD
    viajes,
    viajesActivos,
    viajesHistorial,
    isLoading,
    error,
    
    // Funciones
    actualizarEstadoViaje: actualizarEstadoViaje.mutate,
    isUpdatingEstado: actualizarEstadoViaje.isPending,
    asignarRecursos: asignarRecursos.mutate,
    isAssigningRecursos: asignarRecursos.isPending,
    eliminarViaje: eliminarViaje.mutate,
    isEliminandoViaje: eliminarViaje.isPending
  };
};
