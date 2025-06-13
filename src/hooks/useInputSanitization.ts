
import { useCallback } from 'react';

interface SanitizationOptions {
  maxLength?: number;
  allowSpecialChars?: boolean;
  allowHTML?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

export const useInputSanitization = () => {
  const sanitizeInput = useCallback((
    input: string, 
    type: 'text' | 'email' | 'rfc' | 'phone' = 'text',
    options: SanitizationOptions = {}
  ): string => {
    if (!input || typeof input !== 'string') return '';
    
    const { maxLength = 255, allowSpecialChars = false, allowHTML = false } = options;
    
    let sanitized = input.trim();
    
    // Basic length limit
    sanitized = sanitized.slice(0, maxLength);
    
    // Remove HTML if not allowed
    if (!allowHTML) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
    
    // Remove dangerous patterns
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '');
    
    // Type-specific sanitization
    switch (type) {
      case 'email':
        sanitized = sanitized.toLowerCase();
        break;
      case 'rfc':
        sanitized = sanitized.toUpperCase().replace(/[^A-ZÑ&0-9]/g, '');
        break;
      case 'phone':
        sanitized = sanitized.replace(/[^0-9+()-\s]/g, '');
        break;
      case 'text':
      default:
        if (!allowSpecialChars) {
          sanitized = sanitized.replace(/[<>"'&]/g, '');
        }
        break;
    }
    
    return sanitized;
  }, []);

  const validateEmail = useCallback((email: string): ValidationResult => {
    const sanitized = sanitizeInput(email, 'email');
    
    if (!sanitized) {
      return { isValid: false, error: 'Email es requerido' };
    }
    
    if (sanitized.length > 254) {
      return { isValid: false, error: 'Email demasiado largo' };
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitized)) {
      return { isValid: false, error: 'Formato de email inválido' };
    }
    
    return { isValid: true, sanitizedValue: sanitized };
  }, [sanitizeInput]);

  const validateRFC = useCallback((rfc: string): ValidationResult => {
    const sanitized = sanitizeInput(rfc, 'rfc');
    
    if (!sanitized) {
      return { isValid: false, error: 'RFC es requerido' };
    }
    
    if (sanitized.length < 12 || sanitized.length > 13) {
      return { isValid: false, error: 'RFC debe tener 12 o 13 caracteres' };
    }
    
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfcRegex.test(sanitized)) {
      return { isValid: false, error: 'Formato de RFC inválido' };
    }
    
    return { isValid: true, sanitizedValue: sanitized };
  }, [sanitizeInput]);

  const validatePassword = useCallback((password: string): ValidationResult => {
    if (!password) {
      return { isValid: false, error: 'Contraseña es requerida' };
    }
    
    if (password.length < 8) {
      return { isValid: false, error: 'Contraseña debe tener al menos 8 caracteres' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, error: 'Debe incluir al menos una letra minúscula' };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, error: 'Debe incluir al menos una letra mayúscula' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, error: 'Debe incluir al menos un número' };
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, error: 'Debe incluir al menos un carácter especial' };
    }
    
    return { isValid: true };
  }, []);

  return {
    sanitizeInput,
    validateEmail,
    validateRFC,
    validatePassword
  };
};
