
import { createContext, useContext, ReactNode } from 'react';
import { useAuthState, AuthUser } from './auth/useAuthState';
import { useAuthActions } from './auth/useAuthActions';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<{ needsVerification?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  hasAccess: (resource: string) => boolean;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthState();
  const authActions = useAuthActions();

  const hasAccess = (resource: string): boolean => {
    if (!user) return false;
    
    // Superuser has access to everything
    if (user.usuario?.rol === 'superuser' || user.usuario?.rol_especial === 'superuser') {
      return true;
    }
    
    // Admin has access to most things
    if (user.usuario?.rol === 'admin') {
      return !resource.includes('superuser');
    }
    
    // Regular users have basic access
    return ['dashboard', 'carta-porte', 'profile'].some(allowed => resource.includes(allowed));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      hasAccess,
      ...authActions 
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
