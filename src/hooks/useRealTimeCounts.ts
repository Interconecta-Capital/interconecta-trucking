
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
    queryFn: async () => {
      if (!user?.id) {
        const emptyResult: RealTimeCounts = {
          vehiculos: 0,
          conductores: 0,
          socios: 0,
          remolques: 0,
          cartas_porte: 0,
          cartas_porte_mes: 0,
          viajes: 0,
          viajes_mes: 0
        };
        return emptyResult;
      }

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);

      try {
        // Define a simple type for count results
        type CountResult = { count: number | null };

        // Execute queries with explicit type casting
        const vehiculosData = await supabase
          .from('vehiculos')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true) as { count: number | null };

        const conductoresData = await supabase
          .from('conductores')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true) as { count: number | null };

        const sociosData = await supabase
          .from('socios')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true) as { count: number | null };

        const remolquesData = await supabase
          .from('remolques_ccp')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true) as { count: number | null };

        const cartasData = await supabase
          .from('cartas_porte')
          .select('id', { count: 'exact' })
          .eq('usuario_id', user.id) as { count: number | null };

        const cartasMesData = await supabase
          .from('cartas_porte')
          .select('id', { count: 'exact' })
          .eq('usuario_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString()) as { count: number | null };

        const viajesData = await supabase
          .from('viajes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id) as { count: number | null };

        const viajesMesData = await supabase
          .from('viajes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString()) as { count: number | null };

        // Construct result with explicit type
        const result: RealTimeCounts = {
          vehiculos: vehiculosData.count || 0,
          conductores: conductoresData.count || 0,
          socios: sociosData.count || 0,
          remolques: remolquesData.count || 0,
          cartas_porte: cartasData.count || 0,
          cartas_porte_mes: cartasMesData.count || 0,
          viajes: viajesData.count || 0,
          viajes_mes: viajesMesData.count || 0
        };

        return result;
      } catch (error) {
        console.error('[useRealTimeCounts] Error fetching counts:', error);
        const errorResult: RealTimeCounts = {
          vehiculos: 0,
          conductores: 0,
          socios: 0,
          remolques: 0,
          cartas_porte: 0,
          cartas_porte_mes: 0,
          viajes: 0,
          viajes_mes: 0
        };
        return errorResult;
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
    refetchOnWindowFocus: true,
  });
}
