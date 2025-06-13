
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthValidation = () => {
  const checkRateLimit = useCallback(async (identifier: string, actionType: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_action_type: actionType,
        p_max_attempts: 5,
        p_window_minutes: 15
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow if check fails
      }

      return data;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow if check fails
    }
  }, []);

  const recordRateLimitAttempt = useCallback(async (identifier: string, actionType: string): Promise<void> => {
    try {
      await supabase.rpc('record_rate_limit_attempt', {
        p_identifier: identifier,
        p_action_type: actionType,
        p_metadata: {}
      });
    } catch (error) {
      console.error('Record rate limit attempt error:', error);
    }
  }, []);

  const logSecurityEvent = useCallback(async (
    userId: string | null,
    eventType: string,
    eventData: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> => {
    try {
      await supabase.rpc('log_security_event', {
        p_user_id: userId,
        p_event_type: eventType,
        p_event_data: eventData,
        p_ip_address: ipAddress || null,
        p_user_agent: userAgent || null
      });
    } catch (error) {
      console.error('Log security event error:', error);
    }
  }, []);

  const sanitizeInput = useCallback((input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .slice(0, 255); // Limit length
  }, []);

  const validateRFCFormat = useCallback((rfc: string): { isValid: boolean; message?: string } => {
    if (!rfc) {
      return { isValid: false, message: 'RFC es requerido' };
    }

    const cleanRFC = rfc.trim().toUpperCase();
    
    if (cleanRFC.length < 12 || cleanRFC.length > 13) {
      return { isValid: false, message: 'RFC debe tener 12 o 13 caracteres' };
    }

    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfcRegex.test(cleanRFC)) {
      return { isValid: false, message: 'Formato de RFC inválido' };
    }

    return { isValid: true };
  }, []);

  return {
    checkRateLimit,
    recordRateLimitAttempt,
    logSecurityEvent,
    sanitizeInput,
    validateRFCFormat
  };
};
