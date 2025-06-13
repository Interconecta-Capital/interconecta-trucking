
import { useState, useCallback } from 'react';

interface SanitizationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  removeScripts?: boolean;
  trimWhitespace?: boolean;
}

export const useInputSanitization = () => {
  const [sanitizationErrors, setSanitizationErrors] = useState<Record<string, string>>({});

  const sanitizeInput = useCallback((
    input: string, 
    fieldName: string,
    options: SanitizationOptions = {}
  ): string => {
    const {
      maxLength = 1000,
      allowHtml = false,
      removeScripts = true,
      trimWhitespace = true
    } = options;

    if (!input || typeof input !== 'string') return '';

    let sanitized = input;

    // Trim whitespace if enabled
    if (trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Check length limits
    if (sanitized.length > maxLength) {
      setSanitizationErrors(prev => ({
        ...prev,
        [fieldName]: `Texto demasiado largo (máximo ${maxLength} caracteres)`
      }));
      sanitized = sanitized.slice(0, maxLength);
    } else {
      setSanitizationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Remove or escape HTML tags
    if (!allowHtml) {
      sanitized = sanitized
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // Remove script tags and event handlers
    if (removeScripts) {
      sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/expression\s*\(/gi, '');
    }

    // Remove potential SQL injection patterns
    sanitized = sanitized
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '')
      .replace(/(-{2}|\/\*|\*\/)/g, '');

    // Remove potential XSS patterns
    sanitized = sanitized
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/onload=/gi, '')
      .replace(/onerror=/gi, '');

    return sanitized;
  }, []);

  const validateRFC = useCallback((rfc: string): { isValid: boolean; error?: string } => {
    if (!rfc) return { isValid: false, error: 'RFC es requerido' };
    
    const cleanRFC = rfc.trim().toUpperCase().replace(/[^A-ZÑ&0-9]/g, '');
    
    if (cleanRFC.length < 12 || cleanRFC.length > 13) {
      return { isValid: false, error: 'RFC debe tener entre 12 y 13 caracteres' };
    }
    
    if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(cleanRFC)) {
      return { isValid: false, error: 'Formato de RFC inválido' };
    }
    
    // Check for test/demo patterns
    if (/^(XXXX|TEST|DEMO|AAAA)/.test(cleanRFC)) {
      return { isValid: false, error: 'RFC contiene patrones no válidos' };
    }
    
    return { isValid: true };
  }, []);

  const validateEmail = useCallback((email: string): { isValid: boolean; error?: string } => {
    if (!email) return { isValid: false, error: 'Email es requerido' };
    
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail.length > 254) {
      return { isValid: false, error: 'Email es demasiado largo' };
    }
    
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      return { isValid: false, error: 'Formato de email inválido' };
    }
    
    // Check for dangerous patterns
    if (/(script|javascript|vbscript|onload|onerror)/i.test(cleanEmail)) {
      return { isValid: false, error: 'Email contiene caracteres no permitidos' };
    }
    
    return { isValid: true };
  }, []);

  const clearErrors = useCallback(() => {
    setSanitizationErrors({});
  }, []);

  return {
    sanitizeInput,
    validateRFC,
    validateEmail,
    sanitizationErrors,
    clearErrors
  };
};
