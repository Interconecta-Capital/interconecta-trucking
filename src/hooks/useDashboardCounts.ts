
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
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

type CountResult = { count: number | null; error: any };

async function countTable(
  table: string, 
  userId: string, 
  filters?: { activo?: boolean; dateStart?: string; dateEnd?: string; userIdField?: string }
): Promise<number> {
  try {
    const userIdField = filters?.userIdField || 'user_id';
    let query = supabase.from(table as any).select('*', { count: 'exact', head: true });
    
    query = query.eq(userIdField, userId);
    
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }
    
    if (filters?.dateStart) {
      query = query.gte('created_at', filters.dateStart);
    }
    
    if (filters?.dateEnd) {
      query = query.lte('created_at', filters.dateEnd);
    }
    
    const result = await query;
    
    if (result.error) {
      console.error(`[DashboardCounts] Error counting ${table}:`, result.error);
      return 0;
    }
    
    return (result as any).count ?? 0;
  } catch (error) {
    console.error(`[DashboardCounts] Unexpected error counting ${table}:`, error);
    return 0;
  }
}

export const useDashboardCounts = () => {
  const { user, initialized } = useUnifiedAuth();

  return useQuery<DashboardCounts | null>({
    queryKey: ['dashboard-counts', user?.id],
    queryFn: async (): Promise<DashboardCounts | null> => {
      if (!user?.id) {
        console.warn('[DashboardCounts] No user ID available');
        return null;
      }

      console.log('[DashboardCounts] Fetching counts for user:', user.id);

      try {
        const now = new Date();
        const start = startOfMonth(now).toISOString();
        const end = endOfMonth(now).toISOString();

        // Execute all counts in parallel for better performance
        const [
          vehiculosCount,
          conductoresCount,
          sociosCount,
          remolquesCount,
          cartasCount,
          cartasMesCount,
          viajesCount,
          viajesMesCount,
        ] = await Promise.all([
          countTable('vehiculos', user.id, { activo: true }),
          countTable('conductores', user.id, { activo: true }),
          countTable('socios', user.id, { activo: true }),
          countTable('remolques_ccp', user.id, { activo: true }),
          countTable('cartas_porte', user.id, { userIdField: 'usuario_id' }),
          countTable('cartas_porte', user.id, { userIdField: 'usuario_id', dateStart: start, dateEnd: end }),
          countTable('viajes', user.id),
          countTable('viajes', user.id, { dateStart: start, dateEnd: end }),
        ]);

        const resultado = {
          vehiculos: vehiculosCount,
          conductores: conductoresCount,
          socios: sociosCount,
          remolques: remolquesCount,
          cartas_porte: cartasCount,
          viajes: viajesCount,
          cartas_porte_mes_actual: cartasMesCount,
          viajes_mes_actual: viajesMesCount,
        };

        console.log('[DashboardCounts] Result:', resultado);
        return resultado;
      } catch (error) {
        console.error('[DashboardCounts] Unexpected error:', error);
        return {
          vehiculos: 0,
          conductores: 0,
          socios: 0,
          remolques: 0,
          cartas_porte: 0,
          viajes: 0,
          cartas_porte_mes_actual: 0,
          viajes_mes_actual: 0,
        };
      }
    },
    enabled: !!user?.id && initialized,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
};
