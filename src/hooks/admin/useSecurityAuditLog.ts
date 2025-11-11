import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditFilters {
  eventType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export const useSecurityAuditLog = (filters: AuditFilters) => {
  return useQuery({
    queryKey: ['security-audit', filters],
    queryFn: async () => {
      let query = supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      const { data, error } = await query.limit(200);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useSecurityStats = () => {
  return useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('event_type, created_at')
        .gte('created_at', twentyFourHoursAgo);
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        failedLogins: data.filter(e => e.event_type === 'failed_login').length,
        successfulLogins: data.filter(e => e.event_type === 'login').length,
        byType: data.reduce((acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
      
      return stats;
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
