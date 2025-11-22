
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { toast } from 'sonner';

// Define interface matching actual database schema
export interface Remolque {
  id: string;
  placa: string;
  subtipo_rem?: string;
  autotransporte_id?: string;
  created_at: string;
  // Adding legacy fields for compatibility
  estado?: string;
  activo?: boolean;
  tipo_remolque?: string;
  subtipo_remolque?: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  num_serie?: string;
  user_id?: string;
  updated_at?: string;
  vehiculo_asignado_id?: string;
}

export const useRemolques = () => {
  const { user } = useUnifiedAuth(); // ✅ Directo desde UnifiedAuth, sin provider adicional
  const queryClient = useQueryClient();

  const { data: remolques = [], isLoading: loading } = useQuery({
    queryKey: ['remolques', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('remolques')
        .select('*')
        .eq('user_id', user.id) // ✅ FILTRO DE SEGURIDAD: Solo remolques del usuario autenticado
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching remolques:', error);
        throw error;
      }
      
      // Transform data to include legacy fields  
      return (data || []).map(item => ({
        ...item,
        estado: 'disponible',
        activo: true,
        tipo_remolque: item.subtipo_rem,
        subtipo_remolque: item.subtipo_rem,
        marca: 'Genérico',
        modelo: item.subtipo_rem,
        anio: 2020,
        num_serie: `SER-${item.placa}`,
        user_id: user.id,
        updated_at: item.created_at
      }));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // ✅ Retry con backoff exponencial para evitar fallos transitorios
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Remolque, 'id' | 'created_at'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data: result, error } = await supabase
        .from('remolques')
        .insert({
          placa: data.placa,
          subtipo_rem: data.tipo_remolque || data.subtipo_remolque || data.subtipo_rem,
          autotransporte_id: data.autotransporte_id === 'sin_asignar' || !data.autotransporte_id ? null : data.autotransporte_id
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...result,
        estado: 'disponible',
        activo: true,
        tipo_remolque: result.subtipo_rem,
        subtipo_remolque: result.subtipo_rem,
        user_id: user.id,
        updated_at: result.created_at
      };
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
      if (data.tipo_remolque !== undefined) updateData.subtipo_rem = data.tipo_remolque;
      if (data.subtipo_remolque !== undefined) updateData.subtipo_rem = data.subtipo_remolque;
      if (data.subtipo_rem !== undefined) updateData.subtipo_rem = data.subtipo_rem;
      if (data.autotransporte_id !== undefined) {
        updateData.autotransporte_id = data.autotransporte_id === 'sin_asignar' || !data.autotransporte_id ? null : data.autotransporte_id;
      }

      const { data: result, error } = await supabase
        .from('remolques')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...result,
        estado: 'disponible',
        activo: true,
        tipo_remolque: result.subtipo_rem,
        subtipo_remolque: result.subtipo_rem,
        user_id: user?.id,
        updated_at: result.created_at
      };
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
        .from('remolques')
        .delete()
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
