import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from './useSimpleAuth';
import { toast } from 'sonner';

export interface Conductor {
  id: string;
  user_id: string;
  nombre: string;
  rfc?: string;
  curp?: string;
  telefono?: string;
  email?: string;
  num_licencia?: string;
  tipo_licencia?: string;
  vigencia_licencia?: string;
  direccion?: any;
  estado: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useConductores = () => {
  const { user } = useSimpleAuth();
  const queryClient = useQueryClient();

  const { data: conductores = [], isLoading: loading } = useQuery({
    queryKey: ['conductores', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('conductores')
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
    mutationFn: async (data: Omit<Conductor, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data: result, error } = await supabase
        .from('conductores')
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
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast.success('Conductor creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al crear conductor: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Conductor> }) => {
      const { data: result, error } = await supabase
        .from('conductores')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast.success('Conductor actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar conductor: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('conductores')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast.success('Conductor eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar conductor: ${error.message}`);
    }
  });

  return { 
    conductores, 
    loading,
    crearConductor: createMutation.mutateAsync,
    actualizarConductor: updateMutation.mutateAsync,
    eliminarConductor: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
