
import { useState, useEffect } from 'react';

export const useCSRFProtection = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');

  const generateCSRFToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    // Generate a new CSRF token for this session
    const token = generateCSRFToken();
    setCsrfToken(token);
    
    // Store in session storage for validation
    sessionStorage.setItem('csrf_token', token);
  }, []);

  const validateCSRFToken = (token: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token;
  };

  return {
    csrfToken,
    validateCSRFToken
  };
};
