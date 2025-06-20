
import { createContext, useContext, ReactNode } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';

interface AuthContextType {
  user: any;
  loading: boolean;
  hasAccess: (resource: string) => boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { 
    user, 
    loading, 
    hasAccess, 
    signOut, 
    signIn, 
    signUp, 
    signInWithGoogle, 
    resendConfirmation, 
    updateProfile 
  } = useUnifiedAuth();

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      hasAccess,
      signOut,
      signIn,
      signUp,
      signInWithGoogle,
      resendConfirmation,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
