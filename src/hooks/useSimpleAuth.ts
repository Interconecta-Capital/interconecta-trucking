
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function useSimpleAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  });

  // Initialize auth state
  useEffect(() => {
    console.log('[SimpleAuth] Initializing auth state...');
    
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[SimpleAuth] Session error:', error);
          setAuthState({ user: null, session: null, loading: false });
          return;
        }

        console.log('[SimpleAuth] Initial session:', !!session?.user);
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        });
      } catch (error) {
        console.error('[SimpleAuth] Error getting session:', error);
        setAuthState({ user: null, session: null, loading: false });
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[SimpleAuth] Auth state change:', event, !!session?.user);
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        });

        // Handle successful login with redirect
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('[SimpleAuth] User signed in, redirecting to dashboard');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('[SimpleAuth] User signed out');
          setTimeout(() => {
            window.location.href = '/auth';
          }, 100);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[SimpleAuth] Signing in user...');
      setAuthState(prev => ({ ...prev, loading: true }));

      // Clean up any existing auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        console.error('[SimpleAuth] Sign in error:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciales inválidas. Verifica tu correo y contraseña.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Correo no verificado. Revisa tu bandeja de entrada.');
        } else {
          toast.error('Error al iniciar sesión. Intenta nuevamente.');
        }
        return false;
      }

      if (data.user) {
        console.log('[SimpleAuth] Sign in successful');
        toast.success('Inicio de sesión exitoso');
        return true;
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return false;
    } catch (error) {
      console.error('[SimpleAuth] Sign in error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Error inesperado. Intenta nuevamente.');
      return false;
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[SimpleAuth] Signing in with Google...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('[SimpleAuth] Google auth error:', error);
        toast.error('Error al autenticar con Google');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[SimpleAuth] Google auth error:', error);
      toast.error('Error inesperado con Google auth');
      return false;
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    userData: { nombre: string; empresa?: string; rfc?: string; telefono?: string }
  ): Promise<boolean> => {
    try {
      console.log('[SimpleAuth] Signing up user...');
      setAuthState(prev => ({ ...prev, loading: true }));

      // Clean up any existing auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: userData
        }
      });

      if (error) {
        console.error('[SimpleAuth] Sign up error:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
        
        if (error.message.includes('already registered')) {
          toast.error('Este correo ya está registrado. Inicia sesión en su lugar.');
        } else {
          toast.error('Error en el registro. Verifica tus datos e intenta nuevamente.');
        }
        return false;
      }

      if (data.user) {
        console.log('[SimpleAuth] Sign up successful');
        if (!data.user.email_confirmed_at) {
          setAuthState(prev => ({ ...prev, loading: false }));
          toast.success('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
        } else {
          toast.success('Registro exitoso');
        }
        return true;
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return false;
    } catch (error) {
      console.error('[SimpleAuth] Sign up error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Error inesperado. Intenta nuevamente.');
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log('[SimpleAuth] Signing out...');
      
      // Clean up auth state first
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[SimpleAuth] Sign out error:', error);
        toast.error('Error al cerrar sesión');
        return;
      }

      console.log('[SimpleAuth] Sign out successful');
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('[SimpleAuth] Sign out error:', error);
      toast.error('Error al cerrar sesión');
    }
  }, []);

  const updateProfile = useCallback(async (updates: { telefono?: string; nombre?: string; empresa?: string }) => {
    if (!authState.user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        console.error('[SimpleAuth] Update profile error:', error);
        throw error;
      }

      console.log('[SimpleAuth] Profile updated successfully');
      return true;
    } catch (error) {
      console.error('[SimpleAuth] Update profile error:', error);
      throw error;
    }
  }, [authState.user]);

  const resendConfirmation = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('[SimpleAuth] Resend confirmation error:', error);
        toast.error('Error al reenviar confirmación');
        return false;
      }

      toast.success('Correo de confirmación reenviado');
      return true;
    } catch (error) {
      console.error('[SimpleAuth] Resend confirmation error:', error);
      toast.error('Error inesperado al reenviar confirmación');
      return false;
    }
  }, []);

  const validateEmail = useCallback((email: string): ValidationResult => {
    if (!email) {
      return { isValid: false, message: 'Email es requerido' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Formato de email inválido' };
    }
    
    return { isValid: true };
  }, []);

  const validatePassword = useCallback((password: string): ValidationResult => {
    if (!password) {
      return { isValid: false, message: 'Contraseña es requerida' };
    }
    
    if (password.length < 6) {
      return { isValid: false, message: 'Contraseña debe tener al menos 6 caracteres' };
    }
    
    return { isValid: true };
  }, []);

  const sanitizeInput = useCallback((value: string): string => {
    if (!value) return '';
    return value.replace(/[<>\"'&]/g, '').trim();
  }, []);

  return {
    ...authState,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    updateProfile,
    resendConfirmation,
    validateEmail,
    validatePassword,
    sanitizeInput
  };
}
