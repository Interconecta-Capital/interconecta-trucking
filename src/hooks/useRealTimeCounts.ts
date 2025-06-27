
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
        // Execute each query with simplified type handling
        console.log('[useRealTimeCounts] Starting count queries for user:', user.id);

        // Vehiculos count
        const { count: vehiculosCount } = await supabase
          .from('vehiculos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('activo', true);

        // Conductores count
        const { count: conductoresCount } = await supabase
          .from('conductores')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('activo', true);

        // Socios count
        const { count: sociosCount } = await supabase
          .from('socios')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('activo', true);

        // Remolques count - simplified to avoid deep type instantiation
        const { count: remolquesCount } = await supabase
          .from('remolques_ccp')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('activo', true);

        // Cartas porte total count
        const { count: cartasCount } = await supabase
          .from('cartas_porte')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id);

        // Cartas porte monthly count
        const { count: cartasMesCount } = await supabase
          .from('cartas_porte')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString());

        // Viajes total count
        const { count: viajesCount } = await supabase
          .from('viajes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Viajes monthly count
        const { count: viajesMesCount } = await supabase
          .from('viajes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfCurrentMonth.toISOString())
          .lte('created_at', endOfCurrentMonth.toISOString());

        console.log('[useRealTimeCounts] Query results:', {
          vehiculos: vehiculosCount,
          conductores: conductoresCount,
          socios: sociosCount,
          remolques: remolquesCount,
          cartas_porte: cartasCount,
          cartas_porte_mes: cartasMesCount,
          viajes: viajesCount,
          viajes_mes: viajesMesCount
        });

        return {
          vehiculos: vehiculosCount || 0,
          conductores: conductoresCount || 0,
          socios: sociosCount || 0,
          remolques: remolquesCount || 0,
          cartas_porte: cartasCount || 0,
          cartas_porte_mes: cartasMesCount || 0,
          viajes: viajesCount || 0,
          viajes_mes: viajesMesCount || 0
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
