
import React, { createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from './auth/useAuthState';
import { useAuthActions } from './auth/useAuthActions';
import { useAuthValidation } from './auth/useAuthValidation';
import { UserProfile, ExtendedUser } from './auth/types';

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<{ needsVerification?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  hasAccess: (requiredRole?: string) => boolean;
  validateUniqueRFC: (rfc: string) => Promise<ValidationResult>;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, session, loading, setUser } = useAuthState();
  const authActions = useAuthActions();
  const { validateRFCFormat } = useAuthValidation();

  const hasAccess = (requiredRole?: string): boolean => {
    if (!user) return false;
    if (!requiredRole) return true;
    
    const userRole = user.profile?.rol || user.usuario?.rol || 'usuario';
    const planType = user.profile?.plan_type || 'trial';
    
    switch (requiredRole) {
      case 'admin':
        return userRole === 'admin' || userRole === 'superuser';
      case 'enterprise':
        return planType === 'enterprise' || userRole === 'superuser';
      default:
        return true;
    }
  };

  const validateUniqueRFC = async (rfc: string): Promise<ValidationResult> => {
    const validation = validateRFCFormat(rfc);
    if (!validation.isValid) {
      return { isValid: false, message: validation.message };
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('rfc', rfc.toUpperCase())
        .neq('id', user?.id || '');
      
      if (error) {
        console.error('RFC validation error:', error);
        return { isValid: false, message: 'Error validating RFC' };
      }
      
      if (data.length > 0) {
        return { isValid: false, message: 'RFC already exists' };
      }
      
      return { isValid: true };
    } catch (error) {
      console.error('RFC validation error:', error);
      return { isValid: false, message: 'Error validating RFC' };
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nombre: profileData.nombre || user.profile?.nombre || '',
          email: profileData.email || user.email || '',
          empresa: profileData.empresa,
          rfc: profileData.rfc,
          telefono: profileData.telefono,
          avatar_url: profileData.avatar_url,
          configuracion_calendario: profileData.configuracion_calendario,
          timezone: profileData.timezone,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        profile: {
          ...prev.profile,
          ...profileData
        }
      } : null);

    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut: authActions.signOut,
    signIn: authActions.signIn,
    signUp: authActions.signUp,
    signInWithGoogle: authActions.signInWithGoogle,
    signInWithMagicLink: authActions.signInWithMagicLink,
    resetPassword: authActions.resetPassword,
    updateEmail: authActions.updateEmail,
    updateProfile,
    resendConfirmation: authActions.resendConfirmation,
    hasAccess,
    validateUniqueRFC
  };

  return (
    <AuthContext.Provider value={value}>
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
