
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SessionSecurityConfig {
  inactivityTimeoutMinutes?: number;
  warningMinutesBeforeTimeout?: number;
  maxSessionDurationHours?: number;
}

const DEFAULT_INACTIVITY_TIMEOUT_MINUTES = parseInt(
  import.meta.env.VITE_INACTIVITY_TIMEOUT_MINUTES || '30',
  10
);

export const useSessionSecurity = (config: SessionSecurityConfig = {}) => {
  const {
    inactivityTimeoutMinutes = DEFAULT_INACTIVITY_TIMEOUT_MINUTES,
    warningMinutesBeforeTimeout = 5,
    maxSessionDurationHours = 8
  } = config;

  const navigate = useNavigate();
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
      navigate('/auth');
    } catch (error) {
      console.error('Error during inactivity logout:', error);
    }
  }, [navigate]);

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
          navigate('/auth');
        }
      }
    } catch (error) {
      console.error('Error checking session age:', error);
    }
  }, [navigate, maxSessionDurationHours]);

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
