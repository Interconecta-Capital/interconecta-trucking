
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
    queryFn: async (): Promise<DashboardCounts> => {
      if (!user?.id) {
        return defaultCounts;
      }

      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      try {
        // Simplify queries with explicit typing to avoid deep type inference
        const vehiculosResult = await supabase
          .from('vehiculos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const conductoresResult = await supabase
          .from('conductores')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const sociosResult = await supabase
          .from('socios')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const remolquesResult = await supabase
          .from('remolques_ccp')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const cartasResult = await supabase
          .from('cartas_porte')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString());

        const viajesResult = await supabase
          .from('viajes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString());

        // Build the counts object with explicit number types
        const counts: DashboardCounts = {
          vehiculos: Number(vehiculosResult.count) || 0,
          conductores: Number(conductoresResult.count) || 0,
          socios: Number(sociosResult.count) || 0,
          remolques: Number(remolquesResult.count) || 0,
          cartas_porte: Number(cartasResult.count) || 0,
          viajes: Number(viajesResult.count) || 0,
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
