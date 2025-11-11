import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      // Get user metrics
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo);
      
      // Get subscription distribution
      const { data: subscriptions } = await supabase
        .from('suscripciones')
        .select('status, plan_id');
      
      const subscriptionStats = subscriptions?.reduce((acc, sub) => {
        acc[sub.status] = (acc[sub.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      // Get resource counts
      const { count: totalCartasPorte } = await supabase
        .from('cartas_porte')
        .select('*', { count: 'exact', head: true });
      
      const { count: totalVehiculos } = await supabase
        .from('vehiculos')
        .select('*', { count: 'exact', head: true });
      
      const { count: totalConductores } = await supabase
        .from('conductores')
        .select('*', { count: 'exact', head: true });
      
      const { count: totalViajes } = await supabase
        .from('viajes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'completado');
      
      return {
        users: {
          total: totalUsers || 0,
          new7Days: newUsers || 0,
        },
        subscriptions: subscriptionStats,
        resources: {
          cartasPorte: totalCartasPorte || 0,
          vehiculos: totalVehiculos || 0,
          conductores: totalConductores || 0,
          viajesCompletados: totalViajes || 0,
        },
      };
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

export const useRateLimitStats = () => {
  return useQuery({
    queryKey: ['rate-limit-stats'],
    queryFn: async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('rate_limit_log')
        .select('*')
        .gte('created_at', oneHourAgo);
      
      if (error) throw error;
      
      return {
        total: data.length,
        byAction: data.reduce((acc, log) => {
          acc[log.action_type] = (acc[log.action_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    },
    refetchInterval: 60000,
  });
};
