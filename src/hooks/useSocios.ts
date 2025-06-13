
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Socio {
  id: string;
  user_id: string;
  nombre_razon_social: string;
  rfc: string;
  tipo_persona?: string;
  telefono?: string;
  email?: string;
  direccion?: any;
  estado: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useSocios = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: socios = [], isLoading: loading } = useQuery({
    queryKey: ['socios', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('socios')
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
    mutationFn: async (data: Omit<Socio, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data: result, error } = await supabase
        .from('socios')
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
      queryClient.invalidateQueries({ queryKey: ['socios'] });
      toast.success('Socio creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al crear socio: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Socio> }) => {
      const { data: result, error } = await supabase
        .from('socios')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socios'] });
      toast.success('Socio actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar socio: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('socios')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socios'] });
      toast.success('Socio eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar socio: ${error.message}`);
    }
  });

  return { 
    socios, 
    loading,
    crearSocio: createMutation.mutateAsync,
    actualizarSocio: updateMutation.mutateAsync,
    eliminarSocio: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
