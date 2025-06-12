
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const useAuthValidation = () => {
  const validateUniqueRFC = async (rfc: string): Promise<ValidationResult> => {
    try {
      // First validate RFC format
      const formatValidation = validateRFCFormat(rfc);
      if (!formatValidation.isValid) {
        return formatValidation;
      }

      // Check for rate limiting
      const rateLimitCheck = await checkRateLimit(rfc, 'rfc_validation');
      if (!rateLimitCheck) {
        return {
          isValid: false,
          message: 'Demasiados intentos de validación. Intenta nuevamente en 15 minutos.'
        };
      }

      // Record the validation attempt
      await recordRateLimitAttempt(rfc, 'rfc_validation');

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('rfc', rfc.toUpperCase())
        .maybeSingle();

      if (error) {
        console.error('Error validating RFC:', error);
        return {
          isValid: false,
          message: 'Error al validar RFC. Intenta nuevamente.'
        };
      }

      if (data) {
        return {
          isValid: false,
          message: 'Este RFC ya está registrado en el sistema. Si ya tienes una cuenta, inicia sesión.'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating RFC:', error);
      return {
        isValid: false,
        message: 'Error al validar RFC. Intenta nuevamente.'
      };
    }
  };

  const validateUniqueEmail = async (email: string): Promise<ValidationResult> => {
    try {
      // Sanitize email input
      const sanitizedEmail = sanitizeInput(email);
      
      // Check for rate limiting
      const rateLimitCheck = await checkRateLimit(sanitizedEmail, 'email_validation');
      if (!rateLimitCheck) {
        return {
          isValid: false,
          message: 'Demasiados intentos de validación. Intenta nuevamente en 15 minutos.'
        };
      }

      // Record the validation attempt
      await recordRateLimitAttempt(sanitizedEmail, 'email_validation');

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', sanitizedEmail.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Error validating email:', error);
        return {
          isValid: false,
          message: 'Error al validar correo. Intenta nuevamente.'
        };
      }

      if (data) {
        return {
          isValid: false,
          message: 'Este correo ya está registrado. Inicia sesión o usa "¿Olvidaste tu contraseña?"'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating email:', error);
      return {
        isValid: false,
        message: 'Error al validar correo. Intenta nuevamente.'
      };
    }
  };

  const formatRFC = (rfc: string): string => {
    return sanitizeInput(rfc).toUpperCase().replace(/\s/g, '');
  };

  const validateRFCFormat = (rfc: string): ValidationResult => {
    if (!rfc || typeof rfc !== 'string') {
      return {
        isValid: false,
        message: 'RFC es requerido.'
      };
    }

    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    const formattedRFC = formatRFC(rfc);
    
    if (formattedRFC.length < 12 || formattedRFC.length > 13) {
      return {
        isValid: false,
        message: 'RFC debe tener 12 o 13 caracteres.'
      };
    }
    
    if (!rfcPattern.test(formattedRFC)) {
      return {
        isValid: false,
        message: 'Formato de RFC inválido. Debe tener el formato correcto (ej: XAXX010101000).'
      };
    }

    return { isValid: true };
  };

  const sanitizeInput = (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters and trim whitespace
    return input
      .trim()
      .replace(/[<>'"&]/g, '') // Remove HTML/script injection characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  };

  const checkRateLimit = async (identifier: string, actionType: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_action_type: actionType,
        p_max_attempts: 5,
        p_window_minutes: 15
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error to prevent blocking legitimate users
      }

      return data;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error
    }
  };

  const recordRateLimitAttempt = async (identifier: string, actionType: string, metadata: Record<string, any> = {}): Promise<void> => {
    try {
      await supabase.rpc('record_rate_limit_attempt', {
        p_identifier: identifier,
        p_action_type: actionType,
        p_metadata: metadata
      });
    } catch (error) {
      console.error('Failed to record rate limit attempt:', error);
    }
  };

  const logSecurityEvent = async (
    userId: string | null,
    eventType: string,
    eventData: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> => {
    try {
      await supabase.rpc('log_security_event', {
        p_user_id: userId,
        p_event_type: eventType,
        p_event_data: eventData,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  return {
    validateUniqueRFC,
    validateUniqueEmail,
    validateRFCFormat,
    formatRFC,
    sanitizeInput,
    checkRateLimit,
    recordRateLimitAttempt,
    logSecurityEvent
  };
};
