
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
  cartas_porte_mes_actual: number;
  viajes_mes_actual: number;
}

export const useDashboardCounts = () => {
  const { user } = useAuth();

  return useQuery<DashboardCounts | null>({
    queryKey: ['dashboard-counts', user?.id],
    queryFn: async (): Promise<DashboardCounts | null> => {
      if (!user?.id) return null;

      console.log('[DashboardCounts] Consultando datos para usuario:', user.id);

      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      // Contar vehículos (todos los tiempos)
      const { count: vehiculosCount } = (await (supabase.from('vehiculos') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)) as { count: number | null };

      // Contar conductores (todos los tiempos)
      const { count: conductoresCount } = (await (supabase.from('conductores') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)) as { count: number | null };

      // Contar socios (todos los tiempos)
      const { count: sociosCount } = (await (supabase.from('socios') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)) as { count: number | null };

      // Contar remolques (todos los tiempos)
      const { count: remolquesCount } = (await (supabase.from('remolques_ccp') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)) as { count: number | null };

      // Contar cartas porte (todos los tiempos)
      const { count: cartasCount } = (await (supabase.from('cartas_porte') as any)
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)) as { count: number | null };

      // Contar cartas porte del mes actual
      const { count: cartasMesCount } = (await (supabase.from('cartas_porte') as any)
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())) as { count: number | null };

      // Contar viajes (todos los tiempos)
      const { count: viajesCount } = (await (supabase.from('viajes') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)) as { count: number | null };

      // Contar viajes del mes actual
      const { count: viajesMesCount } = (await (supabase.from('viajes') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())) as { count: number | null };

      const resultado = {
        vehiculos: vehiculosCount ?? 0,
        conductores: conductoresCount ?? 0,
        socios: sociosCount ?? 0,
        remolques: remolquesCount ?? 0,
        cartas_porte: cartasCount ?? 0,
        viajes: viajesCount ?? 0,
        cartas_porte_mes_actual: cartasMesCount ?? 0,
        viajes_mes_actual: viajesMesCount ?? 0,
      };

      console.log('[DashboardCounts] Resultado:', resultado);
      return resultado;
    },
    enabled: !!user?.id,
  });
};
