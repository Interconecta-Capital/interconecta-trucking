
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conductores = [], isLoading: loading } = useQuery({
    queryKey: ['conductores', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching conductores for user:', user.id);
      
      const { data, error } = await supabase
        .from('conductores')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conductores:', error);
        throw error;
      }
      
      console.log('Conductores loaded:', data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos en memoria
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Conductor, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      console.log('Creating conductor:', data);
      
      const { data: result, error } = await supabase
        .from('conductores')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conductor:', error);
        throw error;
      }
      
      console.log('Conductor created:', result);
      return result;
    },
    onSuccess: (newConductor) => {
      // Actualización optimista del cache
      queryClient.setQueryData(['conductores', user?.id], (old: Conductor[] = []) => [newConductor, ...old]);
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast.success('Conductor creado exitosamente');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(`Error al crear conductor: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Conductor> }) => {
      console.log('Updating conductor:', id, data);
      
      const { data: result, error } = await supabase
        .from('conductores')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating conductor:', error);
        throw error;
      }
      
      console.log('Conductor updated:', result);
      return result;
    },
    onSuccess: (updatedConductor) => {
      // Actualización optimista del cache
      queryClient.setQueryData(['conductores', user?.id], (old: Conductor[] = []) => 
        old.map(c => c.id === updatedConductor.id ? updatedConductor : c)
      );
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast.success('Conductor actualizado exitosamente');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(`Error al actualizar conductor: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting conductor:', id);
      
      const { error } = await supabase
        .from('conductores')
        .update({ activo: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting conductor:', error);
        throw error;
      }
      
      console.log('Conductor deleted:', id);
    },
    onSuccess: (_, deletedId) => {
      // Actualización optimista del cache
      queryClient.setQueryData(['conductores', user?.id], (old: Conductor[] = []) => 
        old.filter(c => c.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast.success('Conductor eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
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
