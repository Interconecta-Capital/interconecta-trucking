
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
  numero_serie_vin?: string;
  config_vehicular?: string;
  tipo_carroceria?: string;
  capacidad_carga?: number;
  peso_bruto_vehicular?: number;
  rendimiento?: number;
  tipo_combustible?: 'diesel' | 'gasolina';
  poliza_resp_civil?: string;
  asegura_resp_civil?: string;
  poliza_med_ambiente?: string;
  asegura_med_ambiente?: string;
  vigencia_seguro?: string;
  verificacion_vigencia?: string;
  perm_sct?: string;
  num_permiso_sct?: string;
  vigencia_permiso?: string;
  // Nuevos campos de costos
  costo_mantenimiento_km: number;
  costo_llantas_km: number;
  valor_vehiculo?: number;
  configuracion_ejes: 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3';
  factor_peajes: number;
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
      
      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
    crearVehiculo: createMutation.mutateAsync,
    actualizarVehiculo: updateMutation.mutateAsync,
    eliminarVehiculo: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
