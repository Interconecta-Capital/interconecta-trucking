
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface VehiculoConductor {
  id: string;
  vehiculo_id: string;
  conductor_id: string;
  user_id: string;
  fecha_asignacion: string;
  activo: boolean;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  conductor?: {
    id: string;
    nombre: string;
    rfc?: string;
    num_licencia?: string;
    telefono?: string;
  };
}

export const useVehiculoConductores = (vehiculoId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: asignaciones = [], isLoading } = useQuery({
    queryKey: ['vehiculo-conductores', vehiculoId],
    queryFn: async () => {
      if (!user?.id || !vehiculoId) return [];
      
      const { data, error } = await supabase
        .from('vehiculo_conductores')
        .select(`
          *,
          conductor:conductores(
            id,
            nombre,
            rfc,
            num_licencia,
            telefono
          )
        `)
        .eq('vehiculo_id', vehiculoId)
        .eq('activo', true)
        .order('fecha_asignacion', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!vehiculoId,
    staleTime: 5 * 60 * 1000,
  });

  const asignarConductorMutation = useMutation({
    mutationFn: async ({ vehiculoId, conductorId, observaciones }: {
      vehiculoId: string;
      conductorId: string;
      observaciones?: string;
    }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('vehiculo_conductores')
        .insert({
          vehiculo_id: vehiculoId,
          conductor_id: conductorId,
          user_id: user.id,
          observaciones
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculo-conductores'] });
      toast.success('Conductor asignado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al asignar conductor: ${error.message}`);
    }
  });

  const desasignarConductorMutation = useMutation({
    mutationFn: async (asignacionId: string) => {
      const { error } = await supabase
        .from('vehiculo_conductores')
        .update({ activo: false })
        .eq('id', asignacionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculo-conductores'] });
      toast.success('Conductor desasignado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al desasignar conductor: ${error.message}`);
    }
  });

  return {
    asignaciones,
    isLoading,
    asignarConductor: asignarConductorMutation.mutateAsync,
    desasignarConductor: desasignarConductorMutation.mutateAsync,
    isAssigning: asignarConductorMutation.isPending,
    isUnassigning: desasignarConductorMutation.isPending,
  };
};
