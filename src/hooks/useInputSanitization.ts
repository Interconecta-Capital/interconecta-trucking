import { useState, useCallback } from 'react';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface SanitizationErrors {
  [key: string]: string;
}

export type InputType = 'text' | 'email' | 'rfc' | 'phone' | 'nombre' | 'empresa';

interface SanitizeOptions {
  maxLength?: number;
}

export function useInputSanitization() {
  const [sanitizationErrors, setSanitizationErrors] = useState<SanitizationErrors>({});

  const sanitizeInput = useCallback((value: string, type: InputType, options?: SanitizeOptions): string => {
    if (!value) return '';
    
    let sanitized = value;
    
    // Apply max length if specified
    if (options?.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }
    
    switch (type) {
      case 'email':
        // Remove dangerous characters but keep valid email chars
        return sanitized.replace(/[<>\"'&]/g, '').toLowerCase().trim();
      
      case 'rfc':
        // RFC should only contain letters, numbers, and &
        return sanitized.replace(/[^A-Za-z0-9&Ññ]/g, '').toUpperCase().trim();
      
      case 'phone':
        // Only numbers, spaces, parentheses, dashes, and plus
        return sanitized.replace(/[^0-9\s\(\)\-\+]/g, '').trim();
      
      case 'nombre':
      case 'empresa':
        // Remove HTML/script tags and dangerous characters
        return sanitized.replace(/[<>\"'&]/g, '').trim();
      
      case 'text':
      default:
        // Basic sanitization - remove script tags and dangerous characters
        return sanitized.replace(/[<>\"'&]/g, '').trim();
    }
  }, []);

  const validateEmail = useCallback((email: string): ValidationResult => {
    if (!email) {
      return { isValid: false, error: 'Email es requerido' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Formato de email inválido' };
    }
    
    return { isValid: true };
  }, []);

  const validateRFC = useCallback((rfc: string): ValidationResult => {
    if (!rfc) {
      return { isValid: false, error: 'RFC es requerido' };
    }
    
    // Basic RFC validation - should be 12-13 characters
    if (rfc.length < 12 || rfc.length > 13) {
      return { isValid: false, error: 'RFC debe tener 12 o 13 caracteres' };
    }
    
    // RFC pattern validation
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfcRegex.test(rfc.toUpperCase())) {
      return { isValid: false, error: 'Formato de RFC inválido' };
    }
    
    return { isValid: true };
  }, []);

  const validatePassword = useCallback((password: string): ValidationResult => {
    if (!password) {
      return { isValid: false, error: 'Contraseña es requerida' };
    }
    
    if (password.length < 6) {
      return { isValid: false, error: 'Contraseña debe tener al menos 6 caracteres' };
    }
    
    if (password.length > 128) {
      return { isValid: false, error: 'Contraseña es demasiado larga' };
    }
    
    return { isValid: true };
  }, []);

  const clearErrors = useCallback(() => {
    setSanitizationErrors({});
  }, []);

  const setError = useCallback((field: string, error: string) => {
    setSanitizationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  return {
    sanitizeInput,
    validateEmail,
    validateRFC,
    validatePassword,
    sanitizationErrors,
    clearErrors,
    setError
  };
}
