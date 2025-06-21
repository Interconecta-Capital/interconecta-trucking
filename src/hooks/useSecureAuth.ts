
import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSecureAuth = () => {
  const { user } = useAuth();

  // Log security events
  const logSecurityEvent = useCallback(async (eventType: string, eventData: any = {}) => {
    if (!user) return;

    try {
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_event_data: eventData,
        p_ip_address: null, // Client can't reliably get IP
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user]);

  // Monitor suspicious activity
  useEffect(() => {
    if (!user) return;

    // Log successful login
    logSecurityEvent('USER_LOGIN', {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    });

    // Monitor for rapid requests (basic client-side detection)
    let requestCount = 0;
    const resetTime = 60000; // 1 minute

    const monitorRequests = () => {
      requestCount++;
      if (requestCount > 100) { // More than 100 requests per minute
        logSecurityEvent('SUSPICIOUS_ACTIVITY', {
          type: 'HIGH_REQUEST_RATE',
          count: requestCount,
          timestamp: new Date().toISOString()
        });
        toast.warning('Actividad inusual detectada');
      }
    };

    // Reset counter every minute
    const interval = setInterval(() => {
      requestCount = 0;
    }, resetTime);

    // Add event listener for monitoring
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      monitorRequests();
      return originalFetch(...args);
    };

    return () => {
      clearInterval(interval);
      window.fetch = originalFetch;
      
      // Log logout
      logSecurityEvent('USER_LOGOUT', {
        timestamp: new Date().toISOString()
      });
    };
  }, [user, logSecurityEvent]);

  // Session validation
  const validateSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logSecurityEvent('SESSION_ERROR', { error: error.message });
        return false;
      }
      
      if (!session) {
        logSecurityEvent('SESSION_EXPIRED');
        return false;
      }
      
      // Check if session is close to expiring (within 5 minutes)
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;
      
      if (timeUntilExpiry < 300) { // 5 minutes
        logSecurityEvent('SESSION_NEAR_EXPIRY', { 
          expires_in: timeUntilExpiry 
        });
        
        // Attempt to refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          logSecurityEvent('SESSION_REFRESH_FAILED', { 
            error: refreshError.message 
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logSecurityEvent('SESSION_VALIDATION_ERROR', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }, [logSecurityEvent]);

  // Secure logout
  const secureLogout = useCallback(async () => {
    try {
      await logSecurityEvent('USER_LOGOUT_INITIATED');
      
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      toast.success('Sesión cerrada de forma segura');
    } catch (error) {
      console.error('Secure logout error:', error);
      toast.error('Error al cerrar sesión');
    }
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    validateSession,
    secureLogout
  };
};
