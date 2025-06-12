
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const useSecurityValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  // Enhanced RFC validation with security checks
  const validateRFC = useCallback((rfc: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!rfc) {
      errors.push('RFC es requerido');
      return { isValid: false, errors };
    }

    // Sanitize input
    const cleanRFC = rfc.trim().toUpperCase().replace(/[^A-ZÑ&0-9]/g, '');
    
    // Length validation
    if (cleanRFC.length < 12 || cleanRFC.length > 13) {
      errors.push('RFC debe tener entre 12 y 13 caracteres');
    }
    
    // Pattern validation
    if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(cleanRFC)) {
      errors.push('Formato de RFC inválido');
    }
    
    // Check for suspicious patterns
    if (/^(XXXX|TEST|DEMO)/.test(cleanRFC)) {
      errors.push('RFC contiene patrones no válidos');
    }
    
    return { isValid: errors.length === 0, errors };
  }, []);

  // Enhanced email validation
  const validateEmail = useCallback((email: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email es requerido');
      return { isValid: false, errors };
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // Length check
    if (cleanEmail.length > 254) {
      errors.push('Email es muy largo');
    }
    
    // Pattern validation
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      errors.push('Formato de email inválido');
    }
    
    // Security check for script injection
    if (/(script|javascript|vbscript|onload|onerror)/i.test(cleanEmail)) {
      errors.push('Email contiene caracteres no permitidos');
    }
    
    return { isValid: errors.length === 0, errors };
  }, []);

  // General input sanitization
  const sanitizeInput = useCallback((input: string, maxLength = 255): string => {
    if (!input) return '';
    
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }, []);

  // Rate limiting helper
  const checkRateLimit = useCallback((action: string, maxAttempts = 5): boolean => {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    const recentAttempts = attempts.filter((time: number) => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      toast.error(`Demasiados intentos. Intente nuevamente en 15 minutos.`);
      return false;
    }
    
    recentAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(recentAttempts));
    return true;
  }, []);

  // Validate form data comprehensively
  const validateFormData = useCallback((data: Record<string, any>): ValidationResult => {
    setIsValidating(true);
    const errors: string[] = [];
    
    try {
      // Check for required fields
      const requiredFields = ['nombre', 'email'];
      for (const field of requiredFields) {
        if (!data[field] || typeof data[field] !== 'string') {
          errors.push(`Campo ${field} es requerido`);
        }
      }
      
      // Validate email if provided
      if (data.email) {
        const emailValidation = validateEmail(data.email);
        if (!emailValidation.isValid) {
          errors.push(...emailValidation.errors);
        }
      }
      
      // Validate RFC if provided
      if (data.rfc) {
        const rfcValidation = validateRFC(data.rfc);
        if (!rfcValidation.isValid) {
          errors.push(...rfcValidation.errors);
        }
      }
      
      // Check for suspicious patterns in all string fields
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          if (/(script|javascript|vbscript|onload|onerror)/i.test(value)) {
            errors.push(`Campo ${key} contiene contenido no permitido`);
          }
        }
      });
      
    } catch (error) {
      console.error('Validation error:', error);
      errors.push('Error en validación de datos');
    } finally {
      setIsValidating(false);
    }
    
    return { isValid: errors.length === 0, errors };
  }, [validateEmail, validateRFC]);

  return {
    isValidating,
    validateRFC,
    validateEmail,
    sanitizeInput,
    checkRateLimit,
    validateFormData
  };
};
