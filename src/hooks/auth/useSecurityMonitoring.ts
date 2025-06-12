
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_data: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface RateLimitAttempt {
  id: string;
  identifier: string;
  action_type: string;
  created_at: string;
  metadata: Record<string, any>;
}

export const useSecurityMonitoring = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: usuario } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('auth_user_id', user.id)
          .single();

        setIsAdmin(usuario?.rol === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, []);

  // Fetch security events for admin users
  const { data: securityEvents, refetch: refetchSecurityEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: async (): Promise<SecurityEvent[]> => {
      if (!isAdmin) return [];

      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching security events:', error);
        return [];
      }

      return data || [];
    },
    enabled: isAdmin,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch rate limit attempts for admin users
  const { data: rateLimitAttempts, refetch: refetchRateLimitAttempts } = useQuery({
    queryKey: ['rate-limit-attempts'],
    queryFn: async (): Promise<RateLimitAttempt[]> => {
      if (!isAdmin) return [];

      const { data, error } = await supabase
        .from('rate_limit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching rate limit attempts:', error);
        return [];
      }

      return data || [];
    },
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  // Get security statistics
  const getSecurityStats = () => {
    if (!securityEvents || !rateLimitAttempts) {
      return {
        totalEvents: 0,
        failedLogins: 0,
        successfulLogins: 0,
        registrationAttempts: 0,
        rateLimitViolations: 0
      };
    }

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentEvents = securityEvents.filter(
      event => new Date(event.created_at) > last24Hours
    );

    const recentRateLimitAttempts = rateLimitAttempts.filter(
      attempt => new Date(attempt.created_at) > last24Hours
    );

    return {
      totalEvents: recentEvents.length,
      failedLogins: recentEvents.filter(e => e.event_type === 'login_failed').length,
      successfulLogins: recentEvents.filter(e => e.event_type === 'login_successful').length,
      registrationAttempts: recentEvents.filter(e => e.event_type === 'registration_successful').length,
      rateLimitViolations: recentRateLimitAttempts.length
    };
  };

  // Get suspicious activities
  const getSuspiciousActivities = () => {
    if (!securityEvents || !rateLimitAttempts) return [];

    const suspicious = [];
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check for multiple failed logins from same email
    const failedLogins = securityEvents
      .filter(e => e.event_type === 'login_failed' && new Date(e.created_at) > last24Hours)
      .reduce((acc, event) => {
        const email = event.event_data?.email;
        if (email) {
          acc[email] = (acc[email] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

    Object.entries(failedLogins).forEach(([email, count]) => {
      if (count >= 5) {
        suspicious.push({
          type: 'Multiple Failed Logins',
          description: `${count} intentos fallidos de inicio de sesión para ${email}`,
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Check for rate limit violations
    const rateLimitViolations = rateLimitAttempts
      .filter(a => new Date(a.created_at) > last24Hours)
      .reduce((acc, attempt) => {
        acc[attempt.identifier] = (acc[attempt.identifier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    Object.entries(rateLimitViolations).forEach(([identifier, count]) => {
      if (count >= 10) {
        suspicious.push({
          type: 'Rate Limit Violations',
          description: `${count} violaciones de límite de velocidad para ${identifier}`,
          severity: 'medium',
          timestamp: new Date().toISOString()
        });
      }
    });

    return suspicious;
  };

  return {
    isAdmin,
    securityEvents: securityEvents || [],
    rateLimitAttempts: rateLimitAttempts || [],
    getSecurityStats,
    getSuspiciousActivities,
    refetchSecurityEvents,
    refetchRateLimitAttempts
  };
};
