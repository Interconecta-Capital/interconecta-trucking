
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
  peso_bruto_vehicular?: number;
  capacidad_carga?: number;
  numero_ejes?: number;
  numero_llantas?: number;
  tarjeta_circulacion?: string;
  perm_sct?: string;
  num_permiso_sct?: string;
  poliza_seguro?: string;
  vigencia_seguro?: string;
  aseguradora?: string;
  estado: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useVehiculos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vehiculos = [], isLoading: loading, error } = useQuery({
    queryKey: ['vehiculos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('[useVehiculos] Loading vehicles for user:', user.id);
      
      const { data, error } = await supabase
        .from('vehiculos')
        .select(`
          id,
          user_id,
          placa,
          num_serie,
          modelo,
          marca,
          anio,
          config_vehicular,
          peso_bruto_vehicular,
          capacidad_carga,
          tarjeta_circulacion,
          perm_sct,
          num_permiso_sct,
          poliza_seguro,
          vigencia_seguro,
          aseguradora,
          estado,
          activo,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useVehiculos] Database error:', error);
        throw new Error(`Error cargando vehículos: ${error.message}`);
      }

      console.log('[useVehiculos] Loaded', data?.length || 0, 'vehicles successfully');
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Vehiculo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data: result, error } = await supabase
        .from('vehiculos')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo creado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creating vehicle:', error);
      toast.error(`Error al crear vehículo: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vehiculo> }) => {
      const { data: result, error } = await supabase
        .from('vehiculos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo actualizado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error updating vehicle:', error);
      toast.error(`Error al actualizar vehículo: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehiculos')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error deleting vehicle:', error);
      toast.error(`Error al eliminar vehículo: ${error.message}`);
    }
  });

  return { 
    vehiculos, 
    loading,
    error: error?.message || null,
    crearVehiculo: createMutation.mutateAsync,
    actualizarVehiculo: updateMutation.mutateAsync,
    eliminarVehiculo: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    recargar: () => queryClient.invalidateQueries({ queryKey: ['vehiculos'] }),
  };
};
