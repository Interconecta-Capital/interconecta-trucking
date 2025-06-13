
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CartaPorte {
  id: string;
  usuario_id: string;
  folio?: string;
  tipo_cfdi?: string;
  rfc_emisor: string;
  nombre_emisor?: string;
  rfc_receptor: string;
  nombre_receptor?: string;
  entrada_salida_merc?: string;
  pais_origen_destino?: string;
  via_entrada_salida?: string;
  ubicacion_polo_origen?: string;
  ubicacion_polo_destino?: string;
  transporte_internacional?: boolean;
  registro_istmo?: boolean;
  status?: string;
  xml_generado?: string;
  uuid_fiscal?: string;
  fecha_timbrado?: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCartasPorte = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartasPorte = [], isLoading: loading, error } = useQuery({
    queryKey: ['cartas-porte', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('[CartasPorte] No user ID available');
        return [];
      }
      
      console.log('[CartasPorte] Fetching cartas porte for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('cartas_porte')
          .select('*')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[CartasPorte] Database error:', error);
          // Don't throw error immediately, let React Query handle retries
          if (error.code === 'PGRST116' || error.message.includes('infinite recursion')) {
            console.error('[CartasPorte] RLS recursion detected - returning empty array');
            return [];
          }
          throw error;
        }

        console.log('[CartasPorte] Successfully fetched:', data?.length || 0, 'cartas');
        return data || [];
      } catch (err) {
        console.error('[CartasPorte] Query error:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // Increase stale time to 10 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnReconnect: false,   // Prevent refetch on reconnect
    retry: (failureCount, error: any) => {
      // Don't retry on RLS/recursion errors
      if (error?.code === 'PGRST116' || error?.message?.includes('infinite recursion')) {
        console.error('[CartasPorte] RLS error detected, not retrying');
        return false;
      }
      // Limit retries to prevent excessive requests
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Log any errors for debugging
  useEffect(() => {
    if (error) {
      console.error('[CartasPorte] Query error:', error);
      if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        toast.error('Error de conexión con la base de datos. Reintentando...');
      }
    }
  }, [error]);

  const createMutation = useMutation({
    mutationFn: async (data: Omit<CartaPorte, 'id' | 'usuario_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data: result, error } = await supabase
        .from('cartas_porte')
        .insert({
          ...data,
          usuario_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast.success('Carta porte creada exitosamente');
    },
    onError: (error: any) => {
      console.error('[CartasPorte] Create error:', error);
      toast.error(`Error al crear carta porte: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CartaPorte> }) => {
      const { data: result, error } = await supabase
        .from('cartas_porte')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast.success('Carta porte actualizada exitosamente');
    },
    onError: (error: any) => {
      console.error('[CartasPorte] Update error:', error);
      toast.error(`Error al actualizar carta porte: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cartas_porte')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast.success('Carta porte eliminada exitosamente');
    },
    onError: (error: any) => {
      console.error('[CartasPorte] Delete error:', error);
      toast.error(`Error al eliminar carta porte: ${error.message}`);
    }
  });

  return { 
    cartasPorte, 
    loading,
    error,
    crearCartaPorte: createMutation.mutateAsync,
    actualizarCartaPorte: updateMutation.mutateAsync,
    eliminarCartaPorte: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
