
import { createContext, useContext, ReactNode } from 'react';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
  const navigate = useNavigate();

  // Basic security functions that don't depend on auth
  const logSecurityEvent = async (eventType: string, eventData?: any) => {
    console.log('Security Event:', eventType, eventData);
    // In a real app, this would log to a security service
  };

  const validateSession = async () => {
    // ✅ SECURE: Server-side session validation
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[SecurityProvider] Session validation error:', error);
        return false;
      }
      return !!session && !!session.user;
    } catch (error) {
      console.error('[SecurityProvider] Session validation failed:', error);
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
      // Usar navegación React Router en lugar de window.location.href
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // En caso de error, usar navegación React Router
      navigate('/auth', { replace: true });
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
