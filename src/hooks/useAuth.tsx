
import { createContext, useContext, ReactNode } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useAuthState } from './auth/useAuthState';
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
  // Use the optimized auth state
  const { user: basicUser, session, loading, initialized } = useUnifiedAuth();
  
  // Use the extended auth state for compatibility
  const { user: extendedUser } = useAuthState();
  
  // Use auth actions
  const {
    signIn,
    signUp,
    signInWithGoogle,
    resendConfirmation,
    updateProfile,
    signOut: authSignOut
  } = useAuthActions();

  // Use the extended user if available, fallback to basic user
  const user = extendedUser || basicUser;

  const hasAccess = (resource: string) => {
    // Simple access control - can be enhanced later
    return !!user;
  };

  const signOut = async () => {
    try {
      await authSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback: force redirect
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
