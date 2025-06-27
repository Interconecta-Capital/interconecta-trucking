
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

  const queryResult = useQuery<RealTimeCounts>({
    queryKey: ['real-time-counts', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        const defaultCounts: RealTimeCounts = {
          vehiculos: 0,
          conductores: 0,
          socios: 0,
          remolques: 0,
          cartas_porte: 0,
          cartas_porte_mes: 0,
          viajes: 0,
          viajes_mes: 0
        };
        return defaultCounts;
      }

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);

      // Execute all queries in parallel with simplified type handling
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
        supabase.from('vehiculos').select('id', { count: 'exact' }).eq('user_id', user.id).eq('activo', true),
        supabase.from('conductores').select('id', { count: 'exact' }).eq('user_id', user.id).eq('activo', true),
        supabase.from('socios').select('id', { count: 'exact' }).eq('user_id', user.id).eq('activo', true),
        supabase.from('remolques_ccp').select('id', { count: 'exact' }).eq('user_id', user.id).eq('activo', true),
        supabase.from('cartas_porte').select('id', { count: 'exact' }).eq('usuario_id', user.id),
        supabase.from('cartas_porte').select('id', { count: 'exact' })
          .eq('usuario_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString()),
        supabase.from('viajes').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('viajes').select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString())
      ]);

      // Build result with explicit typing
      const result: RealTimeCounts = {
        vehiculos: vehiculosRes.count || 0,
        conductores: conductoresRes.count || 0,
        socios: sociosRes.count || 0,
        remolques: remolquesRes.count || 0,
        cartas_porte: cartasRes.count || 0,
        cartas_porte_mes: cartasMesRes.count || 0,
        viajes: viajesRes.count || 0,
        viajes_mes: viajesMesRes.count || 0
      };

      return result;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
    refetchOnWindowFocus: true,
  });

  return queryResult;
}
