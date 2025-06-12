
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface VehiculoConductor {
  id: string;
  user_id: string;
  vehiculo_id: string;
  conductor_id: string;
  fecha_asignacion: string;
  observaciones?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  conductor?: {
    id: string;
    nombre: string;
    num_licencia?: string;
    telefono?: string;
    estado: string;
  };
}

export const useVehiculoConductores = (vehiculoId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obtener conductores asignados a un vehículo específico
  const { data: conductoresAsignados = [], isLoading: loadingAsignados } = useQuery({
    queryKey: ['vehiculo-conductores', vehiculoId],
    queryFn: async () => {
      if (!vehiculoId || !user?.id) return [];
      
      console.log('Fetching conductores for vehiculo:', vehiculoId);
      
      const { data, error } = await supabase
        .from('vehiculo_conductores')
        .select(`
          *,
          conductor:conductores(
            id,
            nombre,
            num_licencia,
            telefono,
            estado
          )
        `)
        .eq('vehiculo_id', vehiculoId)
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('fecha_asignacion', { ascending: false });

      if (error) {
        console.error('Error fetching vehiculo conductores:', error);
        throw error;
      }
      
      console.log('Vehiculo conductores loaded:', data?.length || 0);
      return data || [];
    },
    enabled: !!vehiculoId && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos en memoria
    refetchOnWindowFocus: false,
  });

  // Asignar conductor a vehículo
  const asignarConductorMutation = useMutation({
    mutationFn: async ({ vehiculoId, conductorId, observaciones }: { 
      vehiculoId: string; 
      conductorId: string; 
      observaciones?: string;
    }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      console.log('Assigning conductor to vehiculo:', { vehiculoId, conductorId });
      
      // Verificar si ya existe una asignación activa
      const { data: existing } = await supabase
        .from('vehiculo_conductores')
        .select('id')
        .eq('vehiculo_id', vehiculoId)
        .eq('conductor_id', conductorId)
        .eq('activo', true)
        .single();

      if (existing) {
        throw new Error('El conductor ya está asignado a este vehículo');
      }

      const { data: result, error } = await supabase
        .from('vehiculo_conductores')
        .insert({
          user_id: user.id,
          vehiculo_id: vehiculoId,
          conductor_id: conductorId,
          observaciones,
          activo: true,
        })
        .select(`
          *,
          conductor:conductores(
            id,
            nombre,
            num_licencia,
            telefono,
            estado
          )
        `)
        .single();

      if (error) {
        console.error('Error assigning conductor:', error);
        throw error;
      }
      
      console.log('Conductor assigned:', result);
      return result;
    },
    onSuccess: (newAssignment) => {
      // Actualización optimista del cache
      queryClient.setQueryData(
        ['vehiculo-conductores', newAssignment.vehiculo_id], 
        (old: VehiculoConductor[] = []) => [newAssignment, ...old]
      );
      queryClient.invalidateQueries({ queryKey: ['vehiculo-conductores'] });
      toast.success('Conductor asignado exitosamente');
    },
    onError: (error: any) => {
      console.error('Assignment error:', error);
      toast.error(`Error al asignar conductor: ${error.message}`);
    }
  });

  // Desasignar conductor de vehículo
  const desasignarConductorMutation = useMutation({
    mutationFn: async (asignacionId: string) => {
      console.log('Unassigning conductor:', asignacionId);
      
      const { error } = await supabase
        .from('vehiculo_conductores')
        .update({ activo: false })
        .eq('id', asignacionId);

      if (error) {
        console.error('Error unassigning conductor:', error);
        throw error;
      }
      
      console.log('Conductor unassigned:', asignacionId);
      return asignacionId;
    },
    onSuccess: (removedId) => {
      // Actualización optimista del cache
      queryClient.setQueryData(
        ['vehiculo-conductores', vehiculoId], 
        (old: VehiculoConductor[] = []) => old.filter(vc => vc.id !== removedId)
      );
      queryClient.invalidateQueries({ queryKey: ['vehiculo-conductores'] });
      toast.success('Conductor desasignado exitosamente');
    },
    onError: (error: any) => {
      console.error('Unassignment error:', error);
      toast.error(`Error al desasignar conductor: ${error.message}`);
    }
  });

  return {
    conductoresAsignados,
    loadingAsignados,
    asignarConductor: asignarConductorMutation.mutateAsync,
    desasignarConductor: desasignarConductorMutation.mutateAsync,
    isAssigning: asignarConductorMutation.isPending,
    isUnassigning: desasignarConductorMutation.isPending,
  };
};
