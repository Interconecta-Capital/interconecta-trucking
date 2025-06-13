
import { useState, useCallback } from 'react';

interface SanitizationOptions {
  maxLength?: number;
  allowSpecialChars?: boolean;
}

interface EmailValidation {
  isValid: boolean;
  error?: string;
}

export function useInputSanitization() {
  const [sanitizationErrors, setSanitizationErrors] = useState<Record<string, string>>({});

  const sanitizeInput = useCallback((
    value: string, 
    fieldName: string, 
    options: SanitizationOptions = {}
  ): string => {
    const { maxLength = 255 } = options;
    
    // Basic sanitization - remove potentially harmful characters
    let sanitized = value.replace(/[<>]/g, '');
    
    // Truncate if too long
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
      setSanitizationErrors(prev => ({
        ...prev,
        [fieldName]: `Máximo ${maxLength} caracteres permitidos`
      }));
    } else {
      setSanitizationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    return sanitized;
  }, []);

  const validateEmail = useCallback((email: string): EmailValidation => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Email inválido' };
    }
    return { isValid: true };
  }, []);

  const clearErrors = useCallback(() => {
    setSanitizationErrors({});
  }, []);

  return {
    sanitizeInput,
    validateEmail,
    sanitizationErrors,
    clearErrors
  };
}
