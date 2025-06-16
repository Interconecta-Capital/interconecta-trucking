
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
    inactivityTimeoutMinutes = 90, // Aumentado significativamente de 60 a 90 minutos
    warningMinutesBeforeTimeout = 15, // Aumentado de 10 a 15 minutos
    maxSessionDurationHours = 24 // Aumentado de 12 a 24 horas
  } = config;

  const { user } = useAuth();
  const navigate = useNavigate();
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const activityDebounceRef = useRef<NodeJS.Timeout>();
  const isTabActiveRef = useRef<boolean>(true);
  const wasTabInactiveRef = useRef<boolean>(false);

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
            duration: 20000, // Duración más larga del toast
            action: {
              label: 'Mantener sesión',
              onClick: resetActivityTimer
            }
          }
        );
      }
    }, warningTime);

    // Set logout timeout (solo si la pestaña está activa)
    timeoutRef.current = setTimeout(() => {
      if (isTabActiveRef.current) {
        console.log('[SessionSecurity] Logging out due to inactivity');
        handleInactivityLogout();
      }
    }, inactivityTimeoutMinutes * 60 * 1000);
  }, [inactivityTimeoutMinutes, warningMinutesBeforeTimeout]);

  const handleInactivityLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.error('Sesión cerrada por inactividad');
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Error during inactivity logout:', error);
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  const checkSessionAge = useCallback(async () => {
    // Solo verificar si la pestaña está activa
    if (!isTabActiveRef.current || wasTabInactiveRef.current) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const expiresAt = new Date(session.expires_at * 1000).getTime();
      const now = Date.now();
      
      // Check if session is close to expiring (dentro de 4 horas en lugar de 2)
      const fourHours = 4 * 60 * 60 * 1000;
      if (expiresAt - now < fourHours) {
        // Try to refresh the session silently
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('[SessionSecurity] Failed to refresh session:', error);
          await supabase.auth.signOut();
          toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          navigate('/auth', { replace: true });
        } else {
          console.log('[SessionSecurity] Session refreshed successfully');
        }
      }
    } catch (error) {
      console.error('Error checking session age:', error);
    }
  }, [navigate]);

  const handleUserActivity = useCallback(() => {
    if (user && isTabActiveRef.current) {
      // Debounce activity updates mucho más agresivo (aumentado de 5 a 30 segundos)
      if (activityDebounceRef.current) {
        clearTimeout(activityDebounceRef.current);
      }
      
      activityDebounceRef.current = setTimeout(() => {
        resetActivityTimer();
      }, 30000); // 30 segundos de debounce
    }
  }, [user, resetActivityTimer]);

  // Manejar cambios de visibilidad de pestaña de forma más conservadora
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    const wasInactive = !isTabActiveRef.current;
    
    isTabActiveRef.current = isVisible;
    
    if (isVisible && wasInactive && user) {
      // Cuando la pestaña vuelve a estar activa después de estar inactiva
      console.log('[SessionSecurity] Tab became active after being inactive');
      wasTabInactiveRef.current = false;
      
      // Dar más tiempo para que la aplicación se estabilice
      setTimeout(() => {
        resetActivityTimer();
      }, 3000); // Aumentado de 1 a 3 segundos
      
    } else if (!isVisible && user) {
      // Cuando la pestaña se oculta
      console.log('[SessionSecurity] Tab became hidden');
      wasTabInactiveRef.current = true;
      
      // Pausar timers después de un delay más largo
      setTimeout(() => {
        if (!isTabActiveRef.current) {
          console.log('[SessionSecurity] Pausing timers due to prolonged tab inactivity');
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        }
      }, 60000); // 60 segundos de gracia en lugar de 30
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

    // Check session age mucho menos frecuentemente (cada 2 horas en lugar de 1 hora)
    const sessionCheckInterval = setInterval(checkSessionAge, 2 * 60 * 60 * 1000);

    // Add activity listeners con throttling extremadamente conservador
    const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    // Throttle activity events mucho más agresivamente
    let lastActivity = 0;
    const throttledActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 30000) { // Solo procesar actividad cada 30 segundos
        lastActivity = now;
        handleUserActivity();
      }
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });

    // Agregar listener para visibilidad
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    return () => {
      // Cleanup
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (activityDebounceRef.current) clearTimeout(activityDebounceRef.current);
      clearInterval(sessionCheckInterval);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivity);
      });

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, handleUserActivity, resetActivityTimer, checkSessionAge, handleVisibilityChange]);

  return {
    resetActivityTimer,
    lastActivity: lastActivityRef.current
  };
};
