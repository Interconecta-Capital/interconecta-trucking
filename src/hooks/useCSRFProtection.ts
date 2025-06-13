
import { useState, useEffect, useCallback } from 'react';

export function useCSRFProtection() {
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Generate a simple CSRF token (in a real app, this would come from the server)
  const generateToken = useCallback(() => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }, []);

  useEffect(() => {
    setCsrfToken(generateToken());
  }, [generateToken]);

  const protectedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }, [csrfToken]);

  return {
    csrfToken,
    protectedRequest,
  };
}
