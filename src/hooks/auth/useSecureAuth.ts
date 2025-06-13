
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthValidation } from './useAuthValidation';
import { toast } from 'sonner';

export const useSecureAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    checkRateLimit, 
    recordRateLimitAttempt, 
    logSecurityEvent, 
    sanitizeInput,
    validateRFCFormat 
  } = useAuthValidation();

  const secureLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      
      // Check rate limiting for login attempts
      const rateLimitCheck = await checkRateLimit(sanitizedEmail, 'login_attempt');
      if (!rateLimitCheck) {
        toast.error('Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.');
        return false;
      }

      // Record the login attempt
      await recordRateLimitAttempt(sanitizedEmail, 'login_attempt');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password
      });

      if (error) {
        console.error('Login error:', error);
        
        // Log failed login attempt
        await logSecurityEvent(
          null,
          'login_failed',
          { 
            email: sanitizedEmail, 
            error: error.message,
            timestamp: new Date().toISOString()
          },
          undefined,
          navigator.userAgent
        );

        // Generic error message to prevent user enumeration
        toast.error('Credenciales inválidas. Verifica tu correo y contraseña.');
        return false;
      }

      if (data.user) {
        // Log successful login
        await logSecurityEvent(
          data.user.id,
          'login_successful',
          { 
            email: sanitizedEmail,
            timestamp: new Date().toISOString()
          },
          undefined,
          navigator.userAgent
        );

        toast.success('Inicio de sesión exitoso.');
        return true;
      }

      return false;

    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Error inesperado. Intenta nuevamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const secureRegister = async (
    email: string, 
    password: string, 
    nombre: string, 
    rfc?: string,
    empresa?: string,
    telefono?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      const sanitizedNombre = sanitizeInput(nombre);
      const sanitizedRFC = rfc ? sanitizeInput(rfc).toUpperCase() : undefined;
      const sanitizedEmpresa = empresa ? sanitizeInput(empresa) : undefined;
      const sanitizedTelefono = telefono ? sanitizeInput(telefono) : undefined;

      // Validate required fields
      if (!sanitizedEmail || !password || !sanitizedNombre) {
        toast.error('Todos los campos obligatorios deben ser completados.');
        return false;
      }

      // Validate RFC format if provided
      if (sanitizedRFC) {
        const rfcValidation = validateRFCFormat(sanitizedRFC);
        if (!rfcValidation.isValid) {
          toast.error(rfcValidation.message);
          return false;
        }
      }

      // Check rate limiting for registration attempts
      const rateLimitCheck = await checkRateLimit(sanitizedEmail, 'registration_attempt');
      if (!rateLimitCheck) {
        toast.error('Demasiados intentos de registro. Intenta nuevamente en 15 minutos.');
        return false;
      }

      // Record the registration attempt
      await recordRateLimitAttempt(sanitizedEmail, 'registration_attempt');

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: password,
        options: {
          data: {
            nombre: sanitizedNombre,
            rfc: sanitizedRFC,
            empresa: sanitizedEmpresa,
            telefono: sanitizedTelefono
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        
        // Log failed registration attempt
        await logSecurityEvent(
          null,
          'registration_failed',
          { 
            email: sanitizedEmail,
            error: error.message,
            timestamp: new Date().toISOString()
          },
          undefined,
          navigator.userAgent
        );

        if (error.message.includes('already registered')) {
          toast.error('Este correo ya está registrado. Inicia sesión en su lugar.');
        } else {
          toast.error('Error en el registro. Verifica tus datos e intenta nuevamente.');
        }
        return false;
      }

      if (data.user) {
        // Log successful registration
        await logSecurityEvent(
          data.user.id,
          'registration_successful',
          { 
            email: sanitizedEmail,
            timestamp: new Date().toISOString()
          },
          undefined,
          navigator.userAgent
        );

        toast.success('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
        return true;
      }

      return false;

    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Error inesperado. Intenta nuevamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const secureLogout = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.error('Error al cerrar sesión.');
        return;
      }

      // Log successful logout
      if (user) {
        await logSecurityEvent(
          user.id,
          'logout_successful',
          { timestamp: new Date().toISOString() },
          undefined,
          navigator.userAgent
        );
      }

      toast.success('Sesión cerrada exitosamente.');

    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Error inesperado al cerrar sesión.');
    }
  };

  return {
    secureLogin,
    secureRegister,
    secureLogout,
    isLoading
  };
};
