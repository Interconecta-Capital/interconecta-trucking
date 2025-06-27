
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
        // Execute queries without type assertions to avoid deep type instantiation
        const vehiculosResponse = await supabase
          .from('vehiculos')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true);

        const conductoresResponse = await supabase
          .from('conductores')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true);

        const sociosResponse = await supabase
          .from('socios')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true);

        const remolquesResponse = await supabase
          .from('remolques_ccp')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('activo', true);

        const cartasResponse = await supabase
          .from('cartas_porte')
          .select('id', { count: 'exact' })
          .eq('usuario_id', user.id);

        const cartasMesResponse = await supabase
          .from('cartas_porte')
          .select('id', { count: 'exact' })
          .eq('usuario_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString());

        const viajesResponse = await supabase
          .from('viajes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        const viajesMesResponse = await supabase
          .from('viajes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString());

        // Extract counts directly from responses without complex typing
        const result: RealTimeCounts = {
          vehiculos: vehiculosResponse.count || 0,
          conductores: conductoresResponse.count || 0,
          socios: sociosResponse.count || 0,
          remolques: remolquesResponse.count || 0,
          cartas_porte: cartasResponse.count || 0,
          cartas_porte_mes: cartasMesResponse.count || 0,
          viajes: viajesResponse.count || 0,
          viajes_mes: viajesMesResponse.count || 0
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
