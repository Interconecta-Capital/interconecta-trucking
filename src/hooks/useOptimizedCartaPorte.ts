
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CartaPorteOptimizada {
  id: string;
  folio?: string;
  usuario_id: string;
  rfc_emisor?: string;
  nombre_emisor?: string;
  rfc_receptor?: string;
  nombre_receptor?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Hook optimizado para cartas de porte con paginación y cache inteligente
export const useOptimizedCartaPorte = (page = 1, limit = 20) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['cartas-porte-optimized', user?.id, page, limit],
    queryFn: async () => {
      if (!user?.id) return { data: [], count: 0 };
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('cartas_porte')
        .select(`
          id, folio, usuario_id, rfc_emisor, nombre_emisor,
          rfc_receptor, nombre_receptor, status, created_at, updated_at
        `, { count: 'exact' })
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation optimizada para crear carta de porte
  const createMutation = useMutation({
    mutationFn: async (cartaPorteData: any) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('cartas_porte')
        .insert({
          ...cartaPorteData,
          usuario_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte-optimized'] });
      toast.success('Carta de porte creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  return {
    cartasPorte: data?.data || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    crearCartaPorte: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};

// Hook para obtener una carta de porte específica con sus relaciones
export const useCartaPorteCompleta = (cartaPorteId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['carta-porte-completa', cartaPorteId],
    queryFn: async () => {
      if (!cartaPorteId || !user?.id) return null;

      // Query optimizada con todas las relaciones en una sola consulta
      const { data, error } = await supabase
        .from('cartas_porte')
        .select(`
          *,
          ubicaciones!inner(*),
          mercancias!inner(*),
          figuras_transporte!inner(*),
          autotransporte!inner(*)
        `)
        .eq('id', cartaPorteId)
        .eq('usuario_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!cartaPorteId && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};
