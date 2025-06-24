
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Remolque {
  id: string;
  user_id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  num_serie?: string;
  tipo_remolque?: string;
  subtipo_remolque?: string;
  estado: string;
  activo: boolean;
  vehiculo_asignado_id?: string;
  created_at: string;
  updated_at: string;
}

export const useRemolques = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: remolques = [], isLoading: loading } = useQuery({
    queryKey: ['remolques', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('remolques_ccp')
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
    mutationFn: async (data: Omit<Remolque, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data: result, error } = await supabase
        .from('remolques_ccp')
        .insert({
          placa: data.placa,
          marca: data.marca,
          modelo: data.modelo,
          anio: data.anio,
          num_serie: data.num_serie,
          tipo_remolque: data.tipo_remolque,
          subtipo_remolque: data.subtipo_remolque,
          estado: data.estado || 'disponible',
          activo: data.activo ?? true,
          vehiculo_asignado_id: data.vehiculo_asignado_id,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remolques'] });
      toast.success('Remolque creado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creating remolque:', error);
      toast.error(`Error al crear remolque: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Remolque> }) => {
      const updateData: any = {};
      
      if (data.placa !== undefined) updateData.placa = data.placa;
      if (data.marca !== undefined) updateData.marca = data.marca;
      if (data.modelo !== undefined) updateData.modelo = data.modelo;
      if (data.anio !== undefined) updateData.anio = data.anio;
      if (data.num_serie !== undefined) updateData.num_serie = data.num_serie;
      if (data.tipo_remolque !== undefined) updateData.tipo_remolque = data.tipo_remolque;
      if (data.subtipo_remolque !== undefined) updateData.subtipo_remolque = data.subtipo_remolque;
      if (data.estado !== undefined) updateData.estado = data.estado;
      if (data.activo !== undefined) updateData.activo = data.activo;
      if (data.vehiculo_asignado_id !== undefined) updateData.vehiculo_asignado_id = data.vehiculo_asignado_id;

      const { data: result, error } = await supabase
        .from('remolques_ccp')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remolques'] });
      toast.success('Remolque actualizado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error updating remolque:', error);
      toast.error(`Error al actualizar remolque: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('remolques_ccp')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remolques'] });
      toast.success('Remolque eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error deleting remolque:', error);
      toast.error(`Error al eliminar remolque: ${error.message}`);
    }
  });

  return { 
    remolques, 
    loading,
    crearRemolque: createMutation.mutateAsync,
    actualizarRemolque: updateMutation.mutateAsync,
    eliminarRemolque: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
