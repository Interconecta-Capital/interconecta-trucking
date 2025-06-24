
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
          ...data,
          user_id: user.id,
          activo: true,
          estado: data.estado || 'disponible'
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
      const { data: result, error } = await supabase
        .from('remolques_ccp')
        .update(data)
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
