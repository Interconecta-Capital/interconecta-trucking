
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOptimized } from './useAuthOptimized';

export function useSubscriptionOptimized() {
  const { session } = useAuthOptimized();

  return useQuery({
    queryKey: ['subscription', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // Combinar queries relacionadas en una sola
      const [subscriptionResult, plansResult, blocksResult] = await Promise.all([
        supabase
          .from('suscripciones')
          .select(`
            *,
            plan:planes_suscripcion(*)
          `)
          .eq('user_id', session.user.id)
          .maybeSingle(),
        
        supabase
          .from('planes_suscripcion')
          .select('*')
          .eq('activo', true)
          .order('precio_mensual', { ascending: true }),
        
        supabase
          .from('bloqueos_usuario')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('activo', true)
          .maybeSingle()
      ]);

      return {
        subscription: subscriptionResult.data,
        plans: plansResult.data || [],
        userBlocks: blocksResult.data,
        hasActiveSubscription: !!subscriptionResult.data && subscriptionResult.data.status === 'active'
      };
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}
