
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SessionSecurityConfig {
  inactivityTimeoutMinutes?: number;
  warningMinutesBeforeTimeout?: number;
  maxSessionDurationHours?: number;
}

export const useSessionSecurity = (config: SessionSecurityConfig = {}) => {
  const {
    inactivityTimeoutMinutes = 30,
    warningMinutesBeforeTimeout = 5,
    maxSessionDurationHours = 8
  } = config;

  const { user } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const activityDebounceRef = useRef<NodeJS.Timeout>();

  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Set warning timeout
    const warningTime = (inactivityTimeoutMinutes - warningMinutesBeforeTimeout) * 60 * 1000;
    warningTimeoutRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        toast.warning(
          `Su sesión expirará en ${warningMinutesBeforeTimeout} minutos por inactividad.`,
          {
            duration: 10000,
            action: {
              label: 'Mantener sesión',
              onClick: resetActivityTimer
            }
          }
        );
      }
    }, warningTime);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleInactivityLogout();
    }, inactivityTimeoutMinutes * 60 * 1000);
  }, [inactivityTimeoutMinutes, warningMinutesBeforeTimeout]);

  const handleInactivityLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.error('Sesión cerrada por inactividad');
      // Use programmatic navigation instead of window.location.href
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('auth-logout', { detail: { reason: 'inactivity' } });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error during inactivity logout:', error);
    }
  }, []);

  const checkSessionAge = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use expires_at instead of issued_at for session age validation
      const expiresAt = new Date(session.expires_at * 1000).getTime();
      const now = Date.now();
      
      // Check if session is close to expiring (within 1 hour)
      const oneHour = 60 * 60 * 1000;
      if (expiresAt - now < oneHour) {
        // Try to refresh the session
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          await supabase.auth.signOut();
          toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          // Use programmatic navigation instead of window.location.href
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('auth-logout', { detail: { reason: 'expired' } });
            window.dispatchEvent(event);
          }
        }
      }
    } catch (error) {
      console.error('Error checking session age:', error);
    }
  }, [maxSessionDurationHours]);

  const handleUserActivity = useCallback(() => {
    if (user) {
      // Debounce activity updates to reduce frequency
      if (activityDebounceRef.current) {
        clearTimeout(activityDebounceRef.current);
      }
      
      activityDebounceRef.current = setTimeout(() => {
        resetActivityTimer();
      }, 1000); // Debounce for 1 second
    }
  }, [user, resetActivityTimer]);

  useEffect(() => {
    if (!user) {
      // Clear timeouts when user logs out
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (activityDebounceRef.current) clearTimeout(activityDebounceRef.current);
      return;
    }

    // Initialize activity timer
    resetActivityTimer();

    // Check session age every 15 minutes instead of 5 (reduce frequency)
    const sessionCheckInterval = setInterval(checkSessionAge, 15 * 60 * 1000);

    // Add activity listeners with passive option for better performance
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Listen for custom logout events
    const handleLogoutEvent = (event: CustomEvent) => {
      console.log('[SessionSecurity] Logout event received:', event.detail);
      // Navigate programmatically instead of using window.location.href
      window.history.pushState({}, '', '/auth');
      window.location.reload();
    };

    window.addEventListener('auth-logout', handleLogoutEvent as EventListener);

    return () => {
      // Cleanup
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (activityDebounceRef.current) clearTimeout(activityDebounceRef.current);
      clearInterval(sessionCheckInterval);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });

      window.removeEventListener('auth-logout', handleLogoutEvent as EventListener);
    };
  }, [user, handleUserActivity, resetActivityTimer, checkSessionAge]);

  return {
    resetActivityTimer,
    lastActivity: lastActivityRef.current
  };
};
