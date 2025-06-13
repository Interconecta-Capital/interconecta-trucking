
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from './types';

export function useAuthActions() {
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // Clean up existing auth state before login
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      toast.success('Inicio de sesión exitoso');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, userData: any) => {
    try {
      // Clean up existing auth state before registration
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userData
        }
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
        return { needsVerification: true };
      }

      toast.success('Registro exitoso');
      return {};
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Error al registrarse');
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Error al iniciar sesión con Google');
      throw error;
    }
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Link mágico enviado a tu correo');
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast.error(error.message || 'Error al enviar link mágico');
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Clean up auth state first
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast.success('Sesión cerrada exitosamente');
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Error al cerrar sesión');
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        throw error;
      }

      toast.success('Correo de recuperación enviado');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Error al enviar correo de recuperación');
      throw error;
    }
  }, []);

  const updateEmail = useCallback(async (newEmail: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        throw error;
      }

      toast.success('Email actualizado exitosamente');
    } catch (error: any) {
      console.error('Update email error:', error);
      toast.error(error.message || 'Error al actualizar email');
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast.success('Perfil actualizado exitosamente');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Error al actualizar perfil');
      throw error;
    }
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Correo de confirmación reenviado');
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      toast.error(error.message || 'Error al reenviar confirmación');
      throw error;
    }
  }, []);

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updateEmail,
    updateProfile,
    resendConfirmation
  };
}
