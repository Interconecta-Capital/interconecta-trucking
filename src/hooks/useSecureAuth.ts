
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedSecurity } from './useEnhancedSecurity';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useSecureAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { checkRateLimit, logSecurityEvent, validateEmail } = useEnhancedSecurity();
  const navigate = useNavigate();

  const secureLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Validate email format
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.errors[0]);
        return false;
      }

      // Check rate limiting
      const canProceed = await checkRateLimit(email.toLowerCase(), 'login_attempt', {
        maxAttempts: 5,
        windowMinutes: 15,
        enableIpTracking: true
      });

      if (!canProceed) {
        await logSecurityEvent({
          eventType: 'login_rate_limit_exceeded',
          eventData: { email: email.toLowerCase() },
          riskLevel: 'high'
        });
        return false;
      }

      // Clean up any existing auth state
      const existingKeys = Object.keys(localStorage).filter(
        key => key.startsWith('supabase.auth.') || key.includes('sb-')
      );
      existingKeys.forEach(key => localStorage.removeItem(key));

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      if (error) {
        await logSecurityEvent({
          eventType: 'login_failed',
          eventData: { 
            email: email.toLowerCase(), 
            error: error.message,
            timestamp: new Date().toISOString()
          },
          riskLevel: 'medium'
        });

        // Check for specific error types
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciales inválidas. Verifica tu correo y contraseña.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Por favor confirma tu correo electrónico antes de iniciar sesión.');
        } else {
          toast.error('Error al iniciar sesión. Intenta nuevamente.');
        }
        return false;
      }

      if (data.user) {
        await logSecurityEvent({
          userId: data.user.id,
          eventType: 'login_successful',
          eventData: { 
            email: email.toLowerCase(),
            timestamp: new Date().toISOString()
          },
          riskLevel: 'low'
        });

        toast.success('Inicio de sesión exitoso');
        
        // Force page refresh for clean state
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Secure login error:', error);
      toast.error('Error inesperado durante el inicio de sesión');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkRateLimit, logSecurityEvent, validateEmail]);

  const secureLogout = useCallback(async (): Promise<void> => {
    try {
      // Log logout event
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logSecurityEvent({
          userId: user.id,
          eventType: 'user_logout',
          eventData: { timestamp: new Date().toISOString() },
          riskLevel: 'low'
        });
      }

      // Clean up auth state
      const authKeys = Object.keys(localStorage).filter(
        key => key.startsWith('supabase.auth.') || key.includes('sb-')
      );
      authKeys.forEach(key => localStorage.removeItem(key));

      // Sign out globally
      await supabase.auth.signOut({ scope: 'global' });

      // Force navigation to auth page
      navigate('/auth', { replace: true });
      
    } catch (error) {
      console.error('Secure logout error:', error);
      // Force cleanup and redirect even on error
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      navigate('/auth', { replace: true });
    }
  }, [logSecurityEvent, navigate]);

  const secureSignUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Validate inputs
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.errors[0]);
        return false;
      }

      // Check rate limiting
      const canProceed = await checkRateLimit(email.toLowerCase(), 'signup_attempt', {
        maxAttempts: 3,
        windowMinutes: 60,
        enableIpTracking: true
      });

      if (!canProceed) {
        await logSecurityEvent({
          eventType: 'signup_rate_limit_exceeded',
          eventData: { email: email.toLowerCase() },
          riskLevel: 'medium'
        });
        return false;
      }

      // Validate password strength
      if (password.length < 8) {
        toast.error('La contraseña debe tener al menos 8 caracteres');
        return false;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        await logSecurityEvent({
          eventType: 'signup_failed',
          eventData: { 
            email: email.toLowerCase(), 
            error: error.message 
          },
          riskLevel: 'medium'
        });

        if (error.message.includes('User already registered')) {
          toast.error('Este correo ya está registrado. Intenta iniciar sesión.');
        } else {
          toast.error('Error al crear cuenta. Intenta nuevamente.');
        }
        return false;
      }

      if (data.user) {
        await logSecurityEvent({
          userId: data.user.id,
          eventType: 'signup_successful',
          eventData: { 
            email: email.toLowerCase(),
            confirmed: !!data.user.email_confirmed_at
          },
          riskLevel: 'low'
        });

        if (!data.user.email_confirmed_at) {
          toast.success('Cuenta creada. Revisa tu correo para confirmar tu cuenta.');
        } else {
          toast.success('Cuenta creada exitosamente');
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Secure signup error:', error);
      toast.error('Error inesperado durante el registro');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkRateLimit, logSecurityEvent, validateEmail]);

  return {
    secureLogin,
    secureLogout,
    secureSignUp,
    isLoading
  };
};
