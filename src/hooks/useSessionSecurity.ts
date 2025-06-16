
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SessionSecurityConfig {
  inactivityTimeoutMinutes?: number;
  warningMinutesBeforeTimeout?: number;
  maxSessionDurationHours?: number;
}

export const useSessionSecurity = (config: SessionSecurityConfig = {}) => {
  const {
    inactivityTimeoutMinutes = 45, // Aumentado de 30 a 45 minutos
    warningMinutesBeforeTimeout = 5,
    maxSessionDurationHours = 8
  } = config;

  const { user } = useAuth();
  const navigate = useNavigate();
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const activityDebounceRef = useRef<NodeJS.Timeout>();
  const isTabActiveRef = useRef<boolean>(true);

  const resetActivityTimer = useCallback(() => {
    // Solo resetear si la pestaña está activa
    if (!isTabActiveRef.current) return;
    
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Set warning timeout
    const warningTime = (inactivityTimeoutMinutes - warningMinutesBeforeTimeout) * 60 * 1000;
    warningTimeoutRef.current = setTimeout(() => {
      if (!warningShownRef.current && isTabActiveRef.current) {
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
      if (isTabActiveRef.current) {
        handleInactivityLogout();
      }
    }, inactivityTimeoutMinutes * 60 * 1000);
  }, [inactivityTimeoutMinutes, warningMinutesBeforeTimeout]);

  const handleInactivityLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.error('Sesión cerrada por inactividad');
      // Usar navegación de React Router en lugar de window.location.href
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Error during inactivity logout:', error);
      // Solo en caso de error usar navegación directa
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  const checkSessionAge = useCallback(async () => {
    // Solo verificar si la pestaña está activa
    if (!isTabActiveRef.current) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
          navigate('/auth', { replace: true });
        }
      }
    } catch (error) {
      console.error('Error checking session age:', error);
    }
  }, [maxSessionDurationHours, navigate]);

  const handleUserActivity = useCallback(() => {
    if (user && isTabActiveRef.current) {
      // Debounce activity updates to reduce frequency
      if (activityDebounceRef.current) {
        clearTimeout(activityDebounceRef.current);
      }
      
      activityDebounceRef.current = setTimeout(() => {
        resetActivityTimer();
      }, 2000); // Aumentado de 1 a 2 segundos para reducir llamadas
    }
  }, [user, resetActivityTimer]);

  // Manejar visibilidad de la pestaña sin recargar
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    isTabActiveRef.current = isVisible;
    
    if (isVisible && user) {
      // Cuando la pestaña vuelve a estar activa, resetear timer
      console.log('[SessionSecurity] Tab became active, resetting activity timer');
      resetActivityTimer();
    } else if (!isVisible) {
      // Cuando la pestaña se oculta, pausar timers sin cerrar sesión
      console.log('[SessionSecurity] Tab became hidden, pausing timers');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
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

    // Check session age every 30 minutes (aumentado de 15)
    const sessionCheckInterval = setInterval(checkSessionAge, 30 * 60 * 1000);

    // Add activity listeners with passive option for better performance
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Agregar listener para visibilidad sin causar recargas
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    return () => {
      // Cleanup
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (activityDebounceRef.current) clearTimeout(activityDebounceRef.current);
      clearInterval(sessionCheckInterval);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, handleUserActivity, resetActivityTimer, checkSessionAge, handleVisibilityChange]);

  return {
    resetActivityTimer,
    lastActivity: lastActivityRef.current
  };
};
