
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOptimized } from './useAuthOptimized';

export function useCartasPorteOptimized(options = {}) {
  const { session } = useAuthOptimized();
  const { enabled = true, limit = 10 } = options;

  return useQuery({
    queryKey: ['cartas-porte', session?.user?.id, limit],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
        .from('cartas_porte')
        .select('*')
        .eq('usuario_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[CARTAS_PORTE] Error:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!session?.user?.id && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutos
    refetchOnWindowFocus: false,
  });
}
