
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';

interface SecurityContextType {
  logSecurityEvent: (eventType: string, eventData?: any) => Promise<void>;
  validateSession: () => Promise<boolean>;
  secureLogout: () => Promise<void>;
  validateRFC: (rfc: string) => { isValid: boolean; errors: string[] };
  validateEmail: (email: string) => { isValid: boolean; errors: string[] };
  sanitizeInput: (input: string, maxLength?: number) => string;
  checkRateLimit: (action: string, maxAttempts?: number) => boolean;
  validateFormData: (data: Record<string, any>) => { isValid: boolean; errors: string[] };
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const secureAuth = useSecureAuth();
  const validation = useSecurityValidation();

  // Periodic session validation
  useEffect(() => {
    const interval = setInterval(() => {
      secureAuth.validateSession();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [secureAuth]);

  const value: SecurityContextType = {
    ...secureAuth,
    ...validation
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
