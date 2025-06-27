
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

// Simple type for count queries to avoid deep type instantiation
type CountResult = { count: number | null };

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
        // Use Promise.all with explicit type assertions to avoid type instantiation issues
        const [
          vehiculosResult,
          conductoresResult,
          sociosResult,
          remolquesResult,
          cartasResult,
          cartasMesResult,
          viajesResult,
          viajesMesResult
        ] = await Promise.all([
          supabase
            .from('vehiculos')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('activo', true) as Promise<CountResult & { error: any }>,
          
          supabase
            .from('conductores')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('activo', true) as Promise<CountResult & { error: any }>,
          
          supabase
            .from('socios')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('activo', true) as Promise<CountResult & { error: any }>,
          
          supabase
            .from('remolques_ccp')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('activo', true) as Promise<CountResult & { error: any }>,
          
          supabase
            .from('cartas_porte')
            .select('id', { count: 'exact' })
            .eq('usuario_id', user.id) as Promise<CountResult & { error: any }>,
          
          supabase
            .from('cartas_porte')
            .select('id', { count: 'exact' })
            .eq('usuario_id', user.id)
            .gte('created_at', startOfCurrentMonth.toISOString())
            .lte('created_at', endOfCurrentMonth.toISOString()) as Promise<CountResult & { error: any }>,
          
          supabase
            .from('viajes')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id) as Promise<CountResult & { error: any }>,
          
          supabase
            .from('viajes')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .gte('created_at', startOfCurrentMonth.toISOString())
            .lte('created_at', endOfCurrentMonth.toISOString()) as Promise<CountResult & { error: any }>
        ]);

        return {
          vehiculos: vehiculosResult.count ?? 0,
          conductores: conductoresResult.count ?? 0,
          socios: sociosResult.count ?? 0,
          remolques: remolquesResult.count ?? 0,
          cartas_porte: cartasResult.count ?? 0,
          cartas_porte_mes: cartasMesResult.count ?? 0,
          viajes: viajesResult.count ?? 0,
          viajes_mes: viajesMesResult.count ?? 0
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
