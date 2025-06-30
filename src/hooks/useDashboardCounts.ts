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

export const useDashboardCounts = () => {
  const { user } = useAuth();

  return useQuery<DashboardCounts | null>({
    queryKey: ['dashboard-counts', user?.id],
    queryFn: async (): Promise<DashboardCounts | null> => {
      if (!user?.id) return null;

      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      const [vehiculosRes, conductoresRes, sociosRes, remolquesRes, cartasRes, viajesRes] = await Promise.all([
        supabase.from('vehiculos').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('conductores').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('socios').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('remolques_ccp').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase
          .from('cartas_porte')
          .select('id', { count: 'exact' })
          .eq('usuario_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
        supabase
          .from('viajes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
      ]);

      return {
        vehiculos: vehiculosRes.count || 0,
        conductores: conductoresRes.count || 0,
        socios: sociosRes.count || 0,
        remolques: remolquesRes.count || 0,
        cartas_porte: cartasRes.count || 0,
        viajes: viajesRes.count || 0,
      };
    },
    enabled: !!user?.id,
  });
};
