
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';

interface SecurityContextType {
  validateRFC: (rfc: string) => { isValid: boolean; errors: string[] };
  validateEmail: (email: string) => { isValid: boolean; errors: string[] };
  sanitizeInput: (input: string, maxLength?: number) => string;
  checkRateLimit: (action: string, maxAttempts?: number) => boolean;
  validateFormData: (data: Record<string, any>) => { isValid: boolean; errors: string[] };
  logSecurityEvent: (eventType: string, eventData?: any) => Promise<void>;
  validateSession: () => Promise<boolean>;
  secureLogout: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const validation = useSecurityValidation();

  // Basic security functions that don't depend on auth
  const logSecurityEvent = async (eventType: string, eventData?: any) => {
    console.log('Security Event:', eventType, eventData);
    // In a real app, this would log to a security service
  };

  const validateSession = async () => {
    // Basic session validation without depending on useAuth
    try {
      const token = localStorage.getItem('supabase.auth.token');
      return !!token;
    } catch {
      return false;
    }
  };

  const secureLogout = async () => {
    try {
      // Clear all auth-related data
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: SecurityContextType = {
    ...validation,
    logSecurityEvent,
    validateSession,
    secureLogout
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
