
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCSRFProtection = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');

  const generateCSRFToken = useCallback(() => {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), 
      byte => byte.toString(16).padStart(2, '0')).join('');
    setCsrfToken(token);
    sessionStorage.setItem('csrf-token', token);
    return token;
  }, []);

  const validateCSRFToken = useCallback((tokenToValidate: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf-token');
    return storedToken === tokenToValidate && tokenToValidate === csrfToken;
  }, [csrfToken]);

  const getCSRFHeaders = useCallback(() => {
    return {
      'X-CSRF-Token': csrfToken
    };
  }, [csrfToken]);

  useEffect(() => {
    // Generate CSRF token on mount
    if (!csrfToken) {
      generateCSRFToken();
    }
  }, [csrfToken, generateCSRFToken]);

  const protectedRequest = useCallback(async (
    operation: () => Promise<any>,
    providedToken?: string
  ) => {
    const tokenToCheck = providedToken || csrfToken;
    
    if (!validateCSRFToken(tokenToCheck)) {
      throw new Error('CSRF token validation failed');
    }
    
    return await operation();
  }, [csrfToken, validateCSRFToken]);

  return {
    csrfToken,
    generateCSRFToken,
    validateCSRFToken,
    getCSRFHeaders,
    protectedRequest
  };
};
