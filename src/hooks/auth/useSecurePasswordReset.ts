
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthValidation } from './useAuthValidation';
import { toast } from 'sonner';

export const useSecurePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { checkRateLimit, recordRateLimitAttempt, logSecurityEvent, sanitizeInput } = useAuthValidation();

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        toast.error('Formato de correo electrónico inválido');
        return false;
      }

      // Check rate limiting for password reset requests
      const rateLimitCheck = await checkRateLimit(sanitizedEmail, 'password_reset_request');
      if (!rateLimitCheck) {
        toast.error('Demasiados intentos de restablecimiento. Intenta nuevamente en 15 minutos.');
        return false;
      }

      // Record the attempt
      await recordRateLimitAttempt(sanitizedEmail, 'password_reset_request');

      // Request password reset with secure redirect
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('Password reset error:', error);
        
        // Log security event for failed password reset
        await logSecurityEvent(
          null,
          'password_reset_failed',
          { email: sanitizedEmail, error: error.message },
          undefined,
          navigator.userAgent
        );

        toast.error('Error al enviar correo de restablecimiento. Verifica tu correo electrónico.');
        return false;
      }

      // Log successful password reset request
      await logSecurityEvent(
        null,
        'password_reset_requested',
        { email: sanitizedEmail },
        undefined,
        navigator.userAgent
      );

      toast.success('Se ha enviado un correo con instrucciones para restablecer tu contraseña.');
      return true;

    } catch (error) {
      console.error('Password reset request failed:', error);
      toast.error('Error inesperado. Intenta nuevamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Validate password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        return false;
      }

      const { data: { user }, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        toast.error('Error al actualizar contraseña. Intenta nuevamente.');
        return false;
      }

      if (user) {
        // Log successful password update
        await logSecurityEvent(
          user.id,
          'password_updated',
          {},
          undefined,
          navigator.userAgent
        );

        toast.success('Contraseña actualizada exitosamente.');
        return true;
      }

      return false;

    } catch (error) {
      console.error('Password update failed:', error);
      toast.error('Error inesperado. Intenta nuevamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const validatePasswordStrength = (password: string): { isValid: boolean; message?: string } => {
    if (!password || password.length < 8) {
      return {
        isValid: false,
        message: 'La contraseña debe tener al menos 8 caracteres.'
      };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return {
        isValid: false,
        message: 'La contraseña debe incluir al menos una letra minúscula.'
      };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        isValid: false,
        message: 'La contraseña debe incluir al menos una letra mayúscula.'
      };
    }

    if (!/(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        message: 'La contraseña debe incluir al menos un número.'
      };
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return {
        isValid: false,
        message: 'La contraseña debe incluir al menos un carácter especial (@$!%*?&).'
      };
    }

    return { isValid: true };
  };

  return {
    requestPasswordReset,
    updatePassword,
    validatePasswordStrength,
    isLoading
  };
};
