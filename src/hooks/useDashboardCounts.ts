
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface DashboardCounts {
  vehiculos: number;
  conductores: number;
  socios: number;
  remolques: number;
  cartas_porte: number;
  viajes: number;
}

const defaultCounts: DashboardCounts = {
  vehiculos: 0,
  conductores: 0,
  socios: 0,
  remolques: 0,
  cartas_porte: 0,
  viajes: 0,
};

export const useDashboardCounts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-counts', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return defaultCounts;
      }

      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      try {
        // Break down the queries to avoid deep type inference
        const vehiculosRes = await supabase.from('vehiculos').select('id', { count: 'exact' }).eq('user_id', user.id);
        const conductoresRes = await supabase.from('conductores').select('id', { count: 'exact' }).eq('user_id', user.id);
        const sociosRes = await supabase.from('socios').select('id', { count: 'exact' }).eq('user_id', user.id);
        const remolquesRes = await supabase.from('remolques_ccp').select('id', { count: 'exact' }).eq('user_id', user.id);
        
        const cartasRes = await supabase
          .from('cartas_porte')
          .select('id', { count: 'exact' })
          .eq('usuario_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString());
          
        const viajesRes = await supabase
          .from('viajes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString());

        const counts: DashboardCounts = {
          vehiculos: vehiculosRes.count || 0,
          conductores: conductoresRes.count || 0,
          socios: sociosRes.count || 0,
          remolques: remolquesRes.count || 0,
          cartas_porte: cartasRes.count || 0,
          viajes: viajesRes.count || 0,
        };

        return counts;
      } catch (error) {
        console.error('Error fetching dashboard counts:', error);
        return defaultCounts;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
