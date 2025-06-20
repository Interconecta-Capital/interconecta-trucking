
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
  direccion_fiscal?: any;
  regimen_fiscal?: string;
  uso_cfdi?: string;
  estado: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useSocios = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  console.log('[useSocios] Hook called with user:', user?.id);

  const { data: socios = [], isLoading: loading, error } = useQuery({
    queryKey: ['socios', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('[useSocios] No user ID, returning empty array');
        return [];
      }
      
      console.log('[useSocios] Fetching socios for user:', user.id);
      
      const { data, error } = await supabase
        .from('socios')
        .select(`
          id,
          user_id,
          nombre_razon_social,
          rfc,
          telefono,
          email,
          tipo_persona,
          regimen_fiscal,
          uso_cfdi,
          direccion,
          direccion_fiscal,
          estado,
          activo,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useSocios] Error fetching socios:', error);
        throw error;
      }

      console.log('[useSocios] Fetched socios:', data?.length || 0);
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
        .delete()
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

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['socios', user?.id] });
  };

  return { 
    socios, 
    loading,
    error: error as Error | null,
    crearSocio: createMutation.mutateAsync,
    actualizarSocio: updateMutation.mutateAsync,
    eliminarSocio: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    recargar: refetch
  };
};
