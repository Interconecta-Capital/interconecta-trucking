
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
        // Use very simple queries with minimal type complexity
        const [
          vehiculosCount,
          conductoresCount,
          sociosCount,
          remolquesCount,
          cartasCount,
          viajesCount
        ] = await Promise.all([
          supabase.from('vehiculos').select('id').eq('user_id', user.id).then(r => r.data?.length || 0),
          supabase.from('conductores').select('id').eq('user_id', user.id).then(r => r.data?.length || 0),
          supabase.from('socios').select('id').eq('user_id', user.id).then(r => r.data?.length || 0),
          supabase.from('remolques_ccp').select('id').eq('user_id', user.id).then(r => r.data?.length || 0),
          supabase.from('cartas_porte')
            .select('id')
            .eq('usuario_id', user.id)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
            .then(r => r.data?.length || 0),
          supabase.from('viajes')
            .select('id')
            .eq('user_id', user.id)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
            .then(r => r.data?.length || 0)
        ]);

        return {
          vehiculos: vehiculosCount,
          conductores: conductoresCount,
          socios: sociosCount,
          remolques: remolquesCount,
          cartas_porte: cartasCount,
          viajes: viajesCount,
        };
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
