
import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useAdvancedRateLimit } from '@/hooks/useAdvancedRateLimit';
import { useSecureAuth } from '@/hooks/auth/useSecureAuth';
import { toast } from 'sonner';

interface SecurityContextType {
  validateRFC: (rfc: string) => { isValid: boolean; errors: string[] };
  validateEmail: (email: string) => { isValid: boolean; errors: string[] };
  sanitizeInput: (input: string, maxLength?: number) => string;
  checkRateLimit: (action: string, identifier: string, maxAttempts?: number) => Promise<boolean>;
  validateFormData: (data: Record<string, any>) => { isValid: boolean; errors: string[] };
  logSecurityEvent: (eventType: string, eventData?: any) => Promise<void>;
  validateSession: () => Promise<boolean>;
  secureLogout: () => Promise<void>;
  isSecurityModeEnabled: boolean;
  enableSecurityMode: () => void;
  disableSecurityMode: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface EnhancedSecurityProviderProps {
  children: ReactNode;
}

export function EnhancedSecurityProvider({ children }: EnhancedSecurityProviderProps) {
  const [isSecurityModeEnabled, setIsSecurityModeEnabled] = useState(true);
  const { checkRateLimit: advancedRateLimit, recordAttempt } = useAdvancedRateLimit();
  const { secureLogout: authSecureLogout } = useSecureAuth();

  // Enhanced input validation with security patterns
  const validateRFC = (rfc: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!rfc || typeof rfc !== 'string') {
      errors.push('RFC es requerido');
      return { isValid: false, errors };
    }

    const cleanRFC = rfc.trim().toUpperCase();
    
    // Check length
    if (cleanRFC.length < 12 || cleanRFC.length > 13) {
      errors.push('RFC debe tener 12 o 13 caracteres');
    }

    // Check format
    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfcPattern.test(cleanRFC)) {
      errors.push('Formato de RFC inválido');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [/script/i, /select/i, /union/i, /drop/i];
    if (suspiciousPatterns.some(pattern => pattern.test(cleanRFC))) {
      errors.push('RFC contiene caracteres no permitidos');
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateEmail = (email: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!email || typeof email !== 'string') {
      errors.push('Email es requerido');
      return { isValid: false, errors };
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // Basic email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      errors.push('Formato de email inválido');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [/script/i, /javascript/i, /vbscript/i];
    if (suspiciousPatterns.some(pattern => pattern.test(cleanEmail))) {
      errors.push('Email contiene caracteres no permitidos');
    }

    // Check email length
    if (cleanEmail.length > 254) {
      errors.push('Email demasiado largo');
    }

    return { isValid: errors.length === 0, errors };
  };

  const sanitizeInput = (input: string, maxLength: number = 255): string => {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>'"&]/g, '') // Remove HTML/script injection characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, maxLength); // Limit length
  };

  const checkRateLimit = async (
    action: string, 
    identifier: string, 
    maxAttempts: number = 5
  ): Promise<boolean> => {
    if (!isSecurityModeEnabled) return true;

    try {
      const result = await advancedRateLimit(identifier, {
        action,
        maxAttempts,
        windowMinutes: 15,
        enableIpTracking: true
      });

      if (!result.allowed) {
        await logSecurityEvent('rate_limit_exceeded', {
          action,
          identifier,
          maxAttempts,
          remaining: result.remaining
        });
      }

      return result.allowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error to prevent blocking legitimate users
    }
  };

  const validateFormData = (data: Record<string, any>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check for common injection patterns
    const dangerousPatterns = [
      /script/i,
      /javascript/i,
      /vbscript/i,
      /onload/i,
      /onerror/i,
      /eval\(/i,
      /expression\(/i
    ];

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (dangerousPatterns.some(pattern => pattern.test(value))) {
          errors.push(`Campo ${key} contiene contenido no permitido`);
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const logSecurityEvent = async (eventType: string, eventData?: any): Promise<void> => {
    if (!isSecurityModeEnabled) return;

    try {
      // Log to console for development
      console.log('Security Event:', eventType, eventData);
      
      // In production, this would send to your security service
      // await securityService.logEvent(eventType, eventData);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const validateSession = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) return false;

      // Additional session validation logic here
      return true;
    } catch {
      return false;
    }
  };

  const secureLogout = async (): Promise<void> => {
    try {
      await logSecurityEvent('user_logout_initiated');
      
      // Clear all auth-related data
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      await authSecureLogout();
      
      toast.success('Sesión cerrada de forma segura');
    } catch (error) {
      console.error('Secure logout error:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const enableSecurityMode = () => {
    setIsSecurityModeEnabled(true);
    logSecurityEvent('security_mode_enabled');
  };

  const disableSecurityMode = () => {
    setIsSecurityModeEnabled(false);
    logSecurityEvent('security_mode_disabled');
  };

  const value: SecurityContextType = {
    validateRFC,
    validateEmail,
    sanitizeInput,
    checkRateLimit,
    validateFormData,
    logSecurityEvent,
    validateSession,
    secureLogout,
    isSecurityModeEnabled,
    enableSecurityMode,
    disableSecurityMode
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useEnhancedSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useEnhancedSecurity must be used within an EnhancedSecurityProvider');
  }
  return context;
}
