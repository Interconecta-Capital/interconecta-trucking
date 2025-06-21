
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Viaje, EventoViaje, ViajeEstadoParams, EventoViajeParams } from './types';

export const useViajesMutations = () => {
  const queryClient = useQueryClient();

  // Cambiar estado de viaje
  const cambiarEstadoMutation = useMutation({
    mutationFn: async (params: ViajeEstadoParams) => {
      const { data, error } = await supabase
        .from('viajes')
        .update({ 
          estado: params.nuevoEstado,
          observaciones: params.observaciones,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.viajeId)
        .select()
        .single();

      if (error) throw error;
      return data as Viaje;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    }
  });

  // Registrar evento de viaje
  const registrarEventoMutation = useMutation({
    mutationFn: async (params: EventoViajeParams) => {
      const { data, error } = await supabase
        .from('eventos_viaje')
        .insert({
          viaje_id: params.viajeId,
          tipo_evento: params.tipoEvento,
          descripcion: params.descripcion,
          ubicacion: params.ubicacion,
          coordenadas: params.coordenadas,
          automatico: params.automatico || false,
          metadata: params.metadata
        })
        .select()
        .single();

      if (error) throw error;
      return data as EventoViaje;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-viaje'] });
    }
  });

  // Actualizar viaje (para el editor)
  const actualizarViajeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Viaje> }) => {
      const { data, error } = await supabase
        .from('viajes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Viaje;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      toast.success('Viaje actualizado correctamente');
    },
    onError: (error: any) => {
      console.error('Error actualizando viaje:', error);
      toast.error('Error al actualizar el viaje');
    }
  });

  return {
    cambiarEstadoViaje: cambiarEstadoMutation.mutate,
    registrarEventoViaje: registrarEventoMutation.mutate,
    actualizarViaje: actualizarViajeMutation.mutate,
    isLoading: cambiarEstadoMutation.isPending || registrarEventoMutation.isPending,
    isUpdatingViaje: actualizarViajeMutation.isPending
  };
};
