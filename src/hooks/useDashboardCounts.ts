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

      const { count: vehiculosCount } = (await (supabase.from('vehiculos') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)) as { count: number | null };

      const { count: conductoresCount } = (await (supabase.from('conductores') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)) as { count: number | null };

      const { count: sociosCount } = (await (supabase.from('socios') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)) as { count: number | null };

      const { count: remolquesCount } = (await (supabase.from('remolques_ccp') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)) as { count: number | null };

      const { count: cartasCount } = (await (supabase.from('cartas_porte') as any)
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())) as { count: number | null };

      const { count: viajesCount } = (await (supabase.from('viajes') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())) as { count: number | null };

      return {
        vehiculos: vehiculosCount ?? 0,
        conductores: conductoresCount ?? 0,
        socios: sociosCount ?? 0,
        remolques: remolquesCount ?? 0,
        cartas_porte: cartasCount ?? 0,
        viajes: viajesCount ?? 0,
      };
    },
    enabled: !!user?.id,
  });
};
