
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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

export interface EventoViaje {
  id: string;
  viaje_id: string;
  tipo_evento: 'inicio' | 'parada' | 'incidente' | 'entrega' | 'retraso' | 'ubicacion';
  descripcion: string;
  ubicacion?: string;
  coordenadas?: { lat: number; lng: number };
  timestamp: string;
  automatico: boolean;
  metadata?: any;
}

export const useViajesEstados = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obtener viajes activos
  const { data: viajesActivos = [], isLoading: loadingViajes } = useQuery({
    queryKey: ['viajes-activos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching viajes for user:', user.id);
      
      try {
        // First get the raw viajes data
        const { data: viajesData, error: viajesError } = await supabase
          .from('viajes' as any)
          .select('*')
          .eq('user_id', user.id)
          .in('estado', ['programado', 'en_transito', 'retrasado'])
          .order('fecha_inicio_programada', { ascending: true });

        if (viajesError) {
          console.error('Error fetching viajes:', viajesError);
          throw viajesError;
        }

        console.log('Raw viajes data:', viajesData);
        return viajesData || [];
      } catch (error) {
        console.error('Error in viajes query:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Obtener historial de eventos de un viaje
  const obtenerEventosViaje = async (viajeId: string): Promise<EventoViaje[]> => {
    console.log('Fetching eventos for viaje:', viajeId);
    
    try {
      const { data, error } = await supabase
        .from('eventos_viaje' as any)
        .select('*')
        .eq('viaje_id', viajeId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching eventos:', error);
        throw error;
      }

      console.log('Eventos data:', data);
      return data || [];
    } catch (error) {
      console.error('Error in obtenerEventosViaje:', error);
      return [];
    }
  };

  // Cambiar estado de viaje
  const cambiarEstadoViaje = useMutation({
    mutationFn: async ({ 
      viajeId, 
      nuevoEstado, 
      observaciones,
      ubicacionActual 
    }: { 
      viajeId: string; 
      nuevoEstado: Viaje['estado']; 
      observaciones?: string;
      ubicacionActual?: string;
    }) => {
      setIsLoading(true);
      console.log('Changing viaje state:', { viajeId, nuevoEstado, observaciones });

      // Actualizar estado del viaje
      const updateData: any = {
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      };

      // Agregar timestamps según el estado
      if (nuevoEstado === 'en_transito') {
        updateData.fecha_inicio_real = new Date().toISOString();
      } else if (nuevoEstado === 'completado') {
        updateData.fecha_fin_real = new Date().toISOString();
      }

      if (observaciones) {
        updateData.observaciones = observaciones;
      }

      const { data: viaje, error: updateError } = await supabase
        .from('viajes' as any)
        .update(updateData)
        .eq('id', viajeId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating viaje:', updateError);
        throw updateError;
      }

      console.log('Updated viaje:', viaje);

      // Registrar evento
      await registrarEventoViaje({
        viajeId,
        tipoEvento: nuevoEstado === 'en_transito' ? 'inicio' : 
                   nuevoEstado === 'completado' ? 'entrega' : 'ubicacion',
        descripcion: `Estado cambiado a ${nuevoEstado}${observaciones ? `: ${observaciones}` : ''}`,
        ubicacion: ubicacionActual,
        automatico: false
      });

      return viaje;
    },
    onSuccess: (viaje) => {
      queryClient.invalidateQueries({ queryKey: ['viajes-activos'] });
      toast.success(`Viaje actualizado a ${viaje.estado}`);
    },
    onError: (error) => {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado del viaje');
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Registrar evento de viaje
  const registrarEventoViaje = async ({
    viajeId,
    tipoEvento,
    descripcion,
    ubicacion,
    coordenadas,
    automatico = false,
    metadata
  }: {
    viajeId: string;
    tipoEvento: EventoViaje['tipo_evento'];
    descripcion: string;
    ubicacion?: string;
    coordenadas?: { lat: number; lng: number };
    automatico?: boolean;
    metadata?: any;
  }) => {
    console.log('Registering evento:', { viajeId, tipoEvento, descripcion });
    
    try {
      const { error } = await supabase
        .from('eventos_viaje' as any)
        .insert({
          viaje_id: viajeId,
          tipo_evento: tipoEvento,
          descripcion,
          ubicacion,
          coordenadas,
          timestamp: new Date().toISOString(),
          automatico,
          metadata
        });

      if (error) {
        console.error('Error inserting evento:', error);
        throw error;
      }

      console.log('Evento registered successfully');
    } catch (error) {
      console.error('Error in registrarEventoViaje:', error);
      throw error;
    }
  };

  // Iniciar viaje
  const iniciarViaje = async (viajeId: string, ubicacionActual?: string) => {
    await cambiarEstadoViaje.mutateAsync({
      viajeId,
      nuevoEstado: 'en_transito',
      observaciones: 'Viaje iniciado',
      ubicacionActual
    });
  };

  // Completar viaje
  const completarViaje = async (viajeId: string, observaciones?: string) => {
    await cambiarEstadoViaje.mutateAsync({
      viajeId,
      nuevoEstado: 'completado',
      observaciones: observaciones || 'Viaje completado exitosamente'
    });
  };

  // Reportar retraso
  const reportarRetraso = async (viajeId: string, motivo: string, tiempoEstimado?: number) => {
    await cambiarEstadoViaje.mutateAsync({
      viajeId,
      nuevoEstado: 'retrasado',
      observaciones: `Retraso: ${motivo}${tiempoEstimado ? ` (${tiempoEstimado} min estimados)` : ''}`
    });
  };

  // Actualizar ubicación en tiempo real
  const actualizarUbicacion = async (viajeId: string, coordenadas: { lat: number; lng: number }, direccion?: string) => {
    await registrarEventoViaje({
      viajeId,
      tipoEvento: 'ubicacion',
      descripcion: 'Actualización de ubicación',
      ubicacion: direccion,
      coordenadas,
      automatico: true,
      metadata: { timestamp: new Date().toISOString() }
    });

    // Actualizar tracking_data del viaje
    try {
      const { error } = await supabase
        .from('viajes' as any)
        .update({
          tracking_data: {
            ultima_ubicacion: coordenadas,
            ultima_actualizacion: new Date().toISOString(),
            direccion: direccion
          }
        })
        .eq('id', viajeId);

      if (error) {
        console.error('Error updating tracking data:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in actualizarUbicacion:', error);
      throw error;
    }
  };

  return {
    viajesActivos,
    isLoading: loadingViajes || isLoading,
    obtenerEventosViaje,
    cambiarEstadoViaje: cambiarEstadoViaje.mutate,
    registrarEventoViaje,
    iniciarViaje,
    completarViaje,
    reportarRetraso,
    actualizarUbicacion
  };
};
