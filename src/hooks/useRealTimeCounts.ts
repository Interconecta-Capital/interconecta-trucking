
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

  return useQuery({
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
        // Execute queries individually to avoid complex type inference
        const vehiculosQuery = supabase
          .from('vehiculos')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true);

        const conductoresQuery = supabase
          .from('conductores')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true);

        const sociosQuery = supabase
          .from('socios')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true);

        const remolquesQuery = supabase
          .from('remolques_ccp')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true);

        const cartasQuery = supabase
          .from('cartas_porte')
          .select('id', { count: 'exact' })
          .eq('usuario_id', user.id);

        const cartasMesQuery = supabase
          .from('cartas_porte')
          .select('id', { count: 'exact' })
          .eq('usuario_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString());

        const viajesQuery = supabase
          .from('viajes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        const viajesMesQuery = supabase
          .from('viajes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString());

        // Execute all queries
        const [
          vehiculosRes,
          conductoresRes,
          sociosRes,
          remolquesRes,
          cartasRes,
          cartasMesRes,
          viajesRes,
          viajesMesRes
        ] = await Promise.all([
          vehiculosQuery,
          conductoresQuery,
          sociosQuery,
          remolquesQuery,
          cartasQuery,
          cartasMesQuery,
          viajesQuery,
          viajesMesQuery
        ]);

        // Build result with explicit number conversion
        const result: RealTimeCounts = {
          vehiculos: Number(vehiculosRes.count || 0),
          conductores: Number(conductoresRes.count || 0),
          socios: Number(sociosRes.count || 0),
          remolques: Number(remolquesRes.count || 0),
          cartas_porte: Number(cartasRes.count || 0),
          cartas_porte_mes: Number(cartasMesRes.count || 0),
          viajes: Number(viajesRes.count || 0),
          viajes_mes: Number(viajesMesRes.count || 0)
        };

        return result;
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
