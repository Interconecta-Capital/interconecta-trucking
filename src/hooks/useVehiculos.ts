
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Vehiculo {
  id: string;
  user_id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  num_serie?: string;
  config_vehicular?: string;
  poliza_seguro?: string;
  vigencia_seguro?: string;
  verificacion_vigencia?: string;
  id_equipo_gps?: string;
  fecha_instalacion_gps?: string;
  acta_instalacion_gps?: string;
  estado: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useVehiculos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vehiculos = [], isLoading: loading } = useQuery({
    queryKey: ['vehiculos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching vehiculos for user:', user.id);
      
      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehiculos:', error);
        throw error;
      }
      
      console.log('Vehiculos loaded:', data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos en memoria
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Vehiculo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      console.log('Creating vehiculo:', data);
      
      const { data: result, error } = await supabase
        .from('vehiculos')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating vehiculo:', error);
        throw error;
      }
      
      console.log('Vehiculo created:', result);
      return result;
    },
    onSuccess: (newVehiculo) => {
      // Actualización optimista del cache
      queryClient.setQueryData(['vehiculos', user?.id], (old: Vehiculo[] = []) => [newVehiculo, ...old]);
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo creado exitosamente');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(`Error al crear vehículo: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vehiculo> }) => {
      console.log('Updating vehiculo:', id, data);
      
      const { data: result, error } = await supabase
        .from('vehiculos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating vehiculo:', error);
        throw error;
      }
      
      console.log('Vehiculo updated:', result);
      return result;
    },
    onSuccess: (updatedVehiculo) => {
      // Actualización optimista del cache
      queryClient.setQueryData(['vehiculos', user?.id], (old: Vehiculo[] = []) => 
        old.map(v => v.id === updatedVehiculo.id ? updatedVehiculo : v)
      );
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo actualizado exitosamente');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(`Error al actualizar vehículo: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting vehiculo:', id);
      
      const { error } = await supabase
        .from('vehiculos')
        .update({ activo: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting vehiculo:', error);
        throw error;
      }
      
      console.log('Vehiculo deleted:', id);
    },
    onSuccess: (_, deletedId) => {
      // Actualización optimista del cache
      queryClient.setQueryData(['vehiculos', user?.id], (old: Vehiculo[] = []) => 
        old.filter(v => v.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(`Error al eliminar vehículo: ${error.message}`);
    }
  });

  return { 
    vehiculos, 
    loading,
    crearVehiculo: createMutation.mutateAsync,
    actualizarVehiculo: updateMutation.mutateAsync,
    eliminarVehiculo: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
