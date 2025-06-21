
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';

interface CSRFContextType {
  csrfToken: string;
  generateNewToken: () => string;
  validateToken: (token: string) => boolean;
  getCSRFHeaders: () => Record<string, string>;
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined);

interface CSRFProviderProps {
  children: ReactNode;
}

export function CSRFProvider({ children }: CSRFProviderProps) {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const { logSecurityEvent } = useEnhancedSecurity();

  const generateNewToken = (): string => {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), 
      byte => byte.toString(16).padStart(2, '0')).join('');
    setCsrfToken(token);
    sessionStorage.setItem('csrf-token', token);
    return token;
  };

  const validateToken = (tokenToValidate: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf-token');
    const isValid = storedToken === tokenToValidate && tokenToValidate === csrfToken;
    
    if (!isValid) {
      logSecurityEvent({
        eventType: 'csrf_validation_failed',
        eventData: { providedToken: tokenToValidate?.substring(0, 8) + '...' },
        riskLevel: 'high'
      });
    }
    
    return isValid;
  };

  const getCSRFHeaders = (): Record<string, string> => {
    return {
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    if (!csrfToken) {
      generateNewToken();
    }
  }, [csrfToken]);

  const value: CSRFContextType = {
    csrfToken,
    generateNewToken,
    validateToken,
    getCSRFHeaders
  };

  return (
    <CSRFContext.Provider value={value}>
      {children}
    </CSRFContext.Provider>
  );
}

export function useCSRF() {
  const context = useContext(CSRFContext);
  if (context === undefined) {
    throw new Error('useCSRF must be used within a CSRFProvider');
  }
  return context;
}
