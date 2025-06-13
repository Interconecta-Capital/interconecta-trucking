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
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        });
      } catch (error) {
        console.error('Error getting session:', error);
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

        // Handle successful login/register with immediate redirect
        if (event === 'SIGNED_IN' && session?.user) {
          // Pequeño delay para asegurar que el estado se actualice
          setTimeout(() => {
            console.log('[SimpleAuth] Redirecting to dashboard after sign in');
            window.location.href = '/dashboard';
          }, 100);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
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
        toast.success('Inicio de sesión exitoso');
        // El onAuthStateChange manejará la redirección
        return true;
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Error inesperado. Intenta nuevamente.');
      return false;
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
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
        console.error('Google auth error:', error);
        toast.error('Error al autenticar con Google');
        return false;
      }

      // OAuth redirect is handled by Supabase
      return true;
    } catch (error) {
      console.error('Google auth error:', error);
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
      setAuthState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: userData
        }
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
        if (error.message.includes('already registered')) {
          toast.error('Este correo ya está registrado. Inicia sesión en su lugar.');
        } else {
          toast.error('Error en el registro. Verifica tus datos e intenta nuevamente.');
        }
        return false;
      }

      if (data.user) {
        if (!data.user.email_confirmed_at) {
          setAuthState(prev => ({ ...prev, loading: false }));
          toast.success('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
        } else {
          toast.success('Registro exitoso');
          // El onAuthStateChange manejará la redirección
        }
        return true;
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Error inesperado. Intenta nuevamente.');
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast.success('Sesión cerrada exitosamente');
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Error al cerrar sesión');
    }
  }, []);

  const resendConfirmation = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast.error('Error al reenviar confirmación');
        return false;
      }

      toast.success('Correo de confirmación reenviado');
      return true;
    } catch (error) {
      console.error('Resend confirmation error:', error);
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
    resendConfirmation,
    validateEmail,
    validatePassword,
    sanitizeInput
  };
}
