
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
    inactivityTimeoutMinutes = 60, // Aumentado de 45 a 60 minutos
    warningMinutesBeforeTimeout = 10, // Aumentado de 5 a 10 minutos
    maxSessionDurationHours = 12 // Aumentado de 8 a 12 horas
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
    // Solo resetear si la pestaña está activa y fue una actividad real
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
            duration: 15000, // Aumentar duración del toast
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
    // Solo verificar si la pestaña está activa y no estamos en proceso de cambio
    if (!isTabActiveRef.current || wasTabInactiveRef.current) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const expiresAt = new Date(session.expires_at * 1000).getTime();
      const now = Date.now();
      
      // Check if session is close to expiring (within 2 horas en lugar de 1)
      const twoHours = 2 * 60 * 60 * 1000;
      if (expiresAt - now < twoHours) {
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
      // Debounce activity updates para reducir frecuencia (aumentado de 2 a 5 segundos)
      if (activityDebounceRef.current) {
        clearTimeout(activityDebounceRef.current);
      }
      
      activityDebounceRef.current = setTimeout(() => {
        resetActivityTimer();
      }, 5000); // 5 segundos de debounce
    }
  }, [user, resetActivityTimer]);

  // Manejar cambios de visibilidad de pestaña de forma más inteligente
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    const wasInactive = !isTabActiveRef.current;
    
    isTabActiveRef.current = isVisible;
    
    if (isVisible && wasInactive && user) {
      // Cuando la pestaña vuelve a estar activa después de estar inactiva
      console.log('[SessionSecurity] Tab became active after being inactive');
      wasTabInactiveRef.current = false;
      
      // Dar tiempo para que la aplicación se estabilice antes de resetear timers
      setTimeout(() => {
        resetActivityTimer();
      }, 1000);
      
    } else if (!isVisible && user) {
      // Cuando la pestaña se oculta, marcar como inactiva pero NO pausar timers inmediatamente
      console.log('[SessionSecurity] Tab became hidden');
      wasTabInactiveRef.current = true;
      
      // Pausar timers solo después de un delay para evitar pausas/reinicios constantes
      setTimeout(() => {
        if (!isTabActiveRef.current) {
          console.log('[SessionSecurity] Pausing timers due to prolonged tab inactivity');
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        }
      }, 30000); // 30 segundos de gracia
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

    // Check session age mucho menos frecuentemente (cada hora en lugar de 30 minutos)
    const sessionCheckInterval = setInterval(checkSessionAge, 60 * 60 * 1000);

    // Add activity listeners con throttling mejorado
    const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    // Throttle activity events más agresivamente
    let lastActivity = 0;
    const throttledActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 10000) { // Solo procesar actividad cada 10 segundos
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
