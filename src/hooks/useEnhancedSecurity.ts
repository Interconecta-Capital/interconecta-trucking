
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityConfig {
  maxAttempts: number;
  windowMinutes: number;
  enableIpTracking: boolean;
}

interface SecurityEvent {
  userId?: string;
  eventType: string;
  eventData?: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high';
}

export const useEnhancedSecurity = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockExpiry, setBlockExpiry] = useState<Date | null>(null);

  const checkRateLimit = useCallback(async (
    identifier: string,
    actionType: string,
    config: SecurityConfig = {
      maxAttempts: 5,
      windowMinutes: 15,
      enableIpTracking: true
    }
  ): Promise<boolean> => {
    try {
      // Use existing check_rate_limit function for now
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_action_type: actionType,
        p_max_attempts: config.maxAttempts,
        p_window_minutes: config.windowMinutes
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return true; // Allow on error to prevent blocking legitimate users
      }

      if (!data) {
        setIsBlocked(true);
        setBlockExpiry(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour
        toast.error(`Demasiados intentos. Intenta nuevamente en ${config.windowMinutes} minutos.`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true;
    }
  }, []);

  const logSecurityEvent = useCallback(async (event: SecurityEvent): Promise<void> => {
    try {
      // Use existing log_security_event function for now
      await supabase.rpc('log_security_event', {
        p_user_id: event.userId || null,
        p_event_type: event.eventType,
        p_event_data: event.eventData || {},
        p_ip_address: null,
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  const sanitizeInput = useCallback((input: string, maxLength: number = 255): string => {
    if (!input) return '';
    
    // Remove potentially dangerous characters
    let sanitized = input.replace(/[<>'"&]/g, '');
    
    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
  }, []);

  const validateRFC = useCallback((rfc: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!rfc) {
      errors.push('RFC es requerido');
      return { isValid: false, errors };
    }

    const cleanRFC = sanitizeInput(rfc.toUpperCase());
    
    if (cleanRFC.length < 12 || cleanRFC.length > 13) {
      errors.push('RFC debe tener 12 o 13 caracteres');
    }

    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfcPattern.test(cleanRFC)) {
      errors.push('Formato de RFC inválido');
    }

    return { isValid: errors.length === 0, errors };
  }, [sanitizeInput]);

  const validateEmail = useCallback((email: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email es requerido');
      return { isValid: false, errors };
    }

    const cleanEmail = sanitizeInput(email.toLowerCase());
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      errors.push('Formato de email inválido');
    }

    if (cleanEmail.length > 254) {
      errors.push('Email demasiado largo');
    }

    return { isValid: errors.length === 0, errors };
  }, [sanitizeInput]);

  const validateFormData = useCallback((data: Record<string, any>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const dangerousPatterns = [
      /script/i,
      /javascript/i,
      /vbscript/i,
      /onload/i,
      /onerror/i,
      /eval\(/i
    ];

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (dangerousPatterns.some(pattern => pattern.test(value))) {
          errors.push(`Campo ${key} contiene contenido no permitido`);
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  }, []);

  return {
    checkRateLimit,
    logSecurityEvent,
    sanitizeInput,
    validateRFC,
    validateEmail,
    validateFormData,
    isBlocked,
    blockExpiry
  };
};
