
import { createContext, useContext, ReactNode } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useAuthActions } from './auth/useAuthActions';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
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
  const { user, loading, isAuthenticated } = useUnifiedAuth();
  const {
    signIn,
    signUp,
    signInWithGoogle,
    signOut: originalSignOut,
    resendConfirmation,
    updateProfile
  } = useAuthActions();

  const hasAccess = (resource: string) => {
    if (!user) return false;
    
    // Superuser has access to everything
    const isSuperuser = user.user_metadata?.is_superuser === 'true' || 
                       user.user_metadata?.is_admin === 'true';
    if (isSuperuser) return true;
    
    // Basic access control based on subscription
    return true; // For now, all authenticated users have access
  };

  // Enhanced signOut with proper redirection
  const signOut = async () => {
    try {
      await originalSignOut();
      // Redirect to auth page after successful logout
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, redirect to auth
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      isAuthenticated,
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
