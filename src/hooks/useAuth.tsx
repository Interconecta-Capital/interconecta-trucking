
import { createContext, useContext, ReactNode } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useAuthActions } from './auth/useAuthActions';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  initialized: boolean;
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
  // ✅ SOLUCIÓN CRÍTICA: Usar SOLO useUnifiedAuth para evitar queries adicionales que causan logout
  const { user, session, loading, initialized, signOut: unifiedSignOut } = useUnifiedAuth();
  
  // ✅ Usar useAuthActions SOLO para acciones, no para estado
  const {
    signIn,
    signUp,
    signInWithGoogle,
    resendConfirmation,
    updateProfile,
  } = useAuthActions();

  const hasAccess = (resource: string) => {
    // Simple access control - can be enhanced later
    return !!user;
  };

  const signOut = async () => {
    try {
      await unifiedSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      loading, 
      initialized,
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

// Export the optimized hook for direct use
export { useUnifiedAuth } from './useUnifiedAuth';
