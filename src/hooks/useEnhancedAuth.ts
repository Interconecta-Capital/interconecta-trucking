
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from './auth/useSecureAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
}

export const useEnhancedAuth = () => {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const navigate = useNavigate();
  
  const { secureLogin, secureLogout } = useSecureAuth();

  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MINUTES = 15;
  const ATTEMPT_WINDOW_MINUTES = 30;

  const getRecentAttempts = useCallback((email: string): LoginAttempt[] => {
    const windowStart = Date.now() - (ATTEMPT_WINDOW_MINUTES * 60 * 1000);
    return loginAttempts.filter(
      attempt => attempt.email === email && attempt.timestamp > windowStart
    );
  }, [loginAttempts]);

  const checkAccountLockout = useCallback((email: string): boolean => {
    const recentAttempts = getRecentAttempts(email);
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    
    if (failedAttempts.length >= MAX_FAILED_ATTEMPTS) {
      const lockoutEnd = Date.now() + (LOCKOUT_DURATION_MINUTES * 60 * 1000);
      setIsAccountLocked(true);
      setLockoutEndTime(lockoutEnd);
      
      toast.error(
        `Cuenta bloqueada por ${LOCKOUT_DURATION_MINUTES} minutos debido a múltiples intentos fallidos.`
      );
      return true;
    }
    
    return false;
  }, [getRecentAttempts]);

  const recordLoginAttempt = useCallback((email: string, success: boolean) => {
    const attempt: LoginAttempt = {
      email: email.toLowerCase(),
      timestamp: Date.now(),
      success
    };
    
    setLoginAttempts(prev => [...prev.slice(-50), attempt]); // Keep last 50 attempts
  }, []);

  const enhancedLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase();
    
    // Check if account is currently locked
    if (lockoutEndTime && Date.now() < lockoutEndTime) {
      const remainingMinutes = Math.ceil((lockoutEndTime - Date.now()) / (60 * 1000));
      toast.error(`Cuenta bloqueada. Intente nuevamente en ${remainingMinutes} minutos.`);
      return false;
    }
    
    // Check if this attempt would trigger lockout
    if (checkAccountLockout(normalizedEmail)) {
      return false;
    }
    
    try {
      const success = await secureLogin(email, password);
      recordLoginAttempt(normalizedEmail, success);
      
      if (success) {
        // Clear lockout state on successful login
        setIsAccountLocked(false);
        setLockoutEndTime(null);
        
        // Log successful login for security monitoring
        await supabase.rpc('log_security_event', {
          p_user_id: null,
          p_event_type: 'successful_login_after_attempts',
          p_event_data: {
            email: normalizedEmail,
            previous_attempts: getRecentAttempts(normalizedEmail).length
          }
        });
      } else {
        // Check if this failed attempt triggers lockout
        checkAccountLockout(normalizedEmail);
      }
      
      return success;
    } catch (error) {
      recordLoginAttempt(normalizedEmail, false);
      checkAccountLockout(normalizedEmail);
      throw error;
    }
  }, [secureLogin, recordLoginAttempt, checkAccountLockout, getRecentAttempts, lockoutEndTime]);

  const enhancedLogout = useCallback(async () => {
    try {
      await secureLogout();
      
      // Clear local security state
      setLoginAttempts([]);
      setIsAccountLocked(false);
      setLockoutEndTime(null);
      
      // Usar navegación React Router en lugar de window.location
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Enhanced logout error:', error);
      // En caso de error, usar navegación React Router
      navigate('/auth', { replace: true });
    }
  }, [secureLogout, navigate]);

  // Clean up old attempts periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const cutoff = Date.now() - (ATTEMPT_WINDOW_MINUTES * 60 * 1000);
      setLoginAttempts(prev => prev.filter(attempt => attempt.timestamp > cutoff));
      
      // Clear lockout if expired
      if (lockoutEndTime && Date.now() > lockoutEndTime) {
        setIsAccountLocked(false);
        setLockoutEndTime(null);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(cleanup);
  }, [lockoutEndTime]);

  return {
    enhancedLogin,
    enhancedLogout,
    isAccountLocked,
    lockoutEndTime,
    getRecentAttempts
  };
};
