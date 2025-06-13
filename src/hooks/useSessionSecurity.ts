
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
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during inactivity logout:', error);
    }
  }, []);

  const checkSessionAge = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const sessionAge = Date.now() - new Date(session.issued_at).getTime();
      const maxSessionAge = maxSessionDurationHours * 60 * 60 * 1000;

      if (sessionAge > maxSessionAge) {
        await supabase.auth.signOut();
        toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Error checking session age:', error);
    }
  }, [maxSessionDurationHours]);

  const handleUserActivity = useCallback(() => {
    if (user) {
      resetActivityTimer();
    }
  }, [user, resetActivityTimer]);

  useEffect(() => {
    if (!user) {
      // Clear timeouts when user logs out
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      return;
    }

    // Initialize activity timer
    resetActivityTimer();

    // Check session age every 5 minutes
    const sessionCheckInterval = setInterval(checkSessionAge, 5 * 60 * 1000);

    // Add activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      // Cleanup
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      clearInterval(sessionCheckInterval);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user, handleUserActivity, resetActivityTimer, checkSessionAge]);

  return {
    resetActivityTimer,
    lastActivity: lastActivityRef.current
  };
};
