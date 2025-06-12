
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ViajeEstadoParams, EventoViajeParams, Viaje } from './types';

export const useViajesMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Registrar evento de viaje
  const registrarEventoViaje = async (params: EventoViajeParams) => {
    console.log('Registering evento:', params);
    
    try {
      const { error } = await supabase
        .from('eventos_viaje')
        .insert({
          viaje_id: params.viajeId,
          tipo_evento: params.tipoEvento,
          descripcion: params.descripcion,
          ubicacion: params.ubicacion,
          coordenadas: params.coordenadas,
          timestamp: new Date().toISOString(),
          automatico: params.automatico || false,
          metadata: params.metadata
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

  // Cambiar estado de viaje
  const cambiarEstadoViaje = useMutation({
    mutationFn: async (params: ViajeEstadoParams) => {
      setIsLoading(true);
      console.log('Changing viaje state:', params);

      // Actualizar estado del viaje
      const updateData: any = {
        estado: params.nuevoEstado,
        updated_at: new Date().toISOString()
      };

      // Agregar timestamps según el estado
      if (params.nuevoEstado === 'en_transito') {
        updateData.fecha_inicio_real = new Date().toISOString();
      } else if (params.nuevoEstado === 'completado') {
        updateData.fecha_fin_real = new Date().toISOString();
      }

      if (params.observaciones) {
        updateData.observaciones = params.observaciones;
      }

      const { data, error } = await supabase
        .from('viajes')
        .update(updateData)
        .eq('id', params.viajeId)
        .select()
        .single();

      if (error) {
        console.error('Error updating viaje:', error);
        throw error;
      }

      console.log('Updated viaje:', data);

      // Registrar evento
      await registrarEventoViaje({
        viajeId: params.viajeId,
        tipoEvento: params.nuevoEstado === 'en_transito' ? 'inicio' : 
                   params.nuevoEstado === 'completado' ? 'entrega' : 'ubicacion',
        descripcion: `Estado cambiado a ${params.nuevoEstado}${params.observaciones ? `: ${params.observaciones}` : ''}`,
        ubicacion: params.ubicacionActual,
        automatico: false
      });

      return data as Viaje;
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

  return {
    isLoading,
    cambiarEstadoViaje: cambiarEstadoViaje.mutate,
    registrarEventoViaje
  };
};
