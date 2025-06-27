
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface RealTimeCounts {
  vehiculos: number;
  conductores: number;
  socios: number;
  remolques: number;
  cartas_porte: number;
  cartas_porte_mes: number;
  viajes: number;
  viajes_mes: number;
}

export function useRealTimeCounts() {
  const { user } = useAuth();

  return useQuery<RealTimeCounts>({
    queryKey: ['real-time-counts', user?.id],
    queryFn: async (): Promise<RealTimeCounts> => {
      if (!user?.id) {
        return {
          vehiculos: 0,
          conductores: 0,
          socios: 0,
          remolques: 0,
          cartas_porte: 0,
          cartas_porte_mes: 0,
          viajes: 0,
          viajes_mes: 0
        };
      }

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);

      try {
        // Execute each query separately to avoid complex type issues
        const vehiculosResult = await supabase
          .from('vehiculos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('activo', true);

        const conductoresResult = await supabase
          .from('conductores')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('activo', true);

        const sociosResult = await supabase
          .from('socios')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('activo', true);

        const remolquesResult = await supabase
          .from('remolques_ccp')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('activo', true);

        const cartasResult = await supabase
          .from('cartas_porte')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id);

        const cartasMesResult = await supabase
          .from('cartas_porte')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString());

        const viajesResult = await supabase
          .from('viajes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const viajesMesResult = await supabase
          .from('viajes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString());

        // Extract counts directly from the results
        const vehiculosCount = vehiculosResult.count || 0;
        const conductoresCount = conductoresResult.count || 0;
        const sociosCount = sociosResult.count || 0;
        const remolquesCount = remolquesResult.count || 0;
        const cartasCount = cartasResult.count || 0;
        const cartasMesCount = cartasMesResult.count || 0;
        const viajesCount = viajesResult.count || 0;
        const viajesMesCount = viajesMesResult.count || 0;

        return {
          vehiculos: vehiculosCount,
          conductores: conductoresCount,
          socios: sociosCount,
          remolques: remolquesCount,
          cartas_porte: cartasCount,
          cartas_porte_mes: cartasMesCount,
          viajes: viajesCount,
          viajes_mes: viajesMesCount
        };
      } catch (error) {
        console.error('[useRealTimeCounts] Error fetching counts:', error);
        return {
          vehiculos: 0,
          conductores: 0,
          socios: 0,
          remolques: 0,
          cartas_porte: 0,
          cartas_porte_mes: 0,
          viajes: 0,
          viajes_mes: 0
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
    refetchOnWindowFocus: true,
  });
}
