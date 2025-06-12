
import { supabase } from '@/integrations/supabase/client';
import { UserSignUpData } from './types';
import { createTenantAndUser, getRedirectUrl } from './useAuthUtils';

/**
 * Hook personalizado para manejar todas las acciones de autenticación
 * Incluye login, signup, logout, reset de contraseña, etc.
 */
export const useAuthActions = () => {
  
  /**
   * Iniciar sesión con email y contraseña
   * Verifica que el email esté confirmado antes de permitir el acceso
   */
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Verificar si el usuario ha confirmado su email
    if (data.user && !data.user.email_confirmed_at) {
      throw new Error('Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
    }
  };

  /**
   * Registrar nuevo usuario con email y contraseña
   * Maneja la creación del tenant y usuario asociado
   */
  const signUp = async (email: string, password: string, userData: UserSignUpData) => {
    const redirectUrl = getRedirectUrl();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData,
      },
    });
    
    if (error) {
      // Detectar si el usuario ya existe y lanzar error específico
      if (error.message?.includes('User already registered')) {
        throw new Error('El correo electrónico ya está registrado. Por favor inicia sesión.');
      }
      throw error;
    }
    
    // Si el usuario se registró exitosamente pero necesita confirmar email
    if (data.user && !data.user.email_confirmed_at) {
      console.log('Usuario creado, necesita confirmación por email');
      return { needsVerification: true };
    }
    
    // Si el usuario se registró exitosamente y ya está confirmado
    if (data.user && data.user.email_confirmed_at) {
      await createTenantAndUser(data.user.id, email, userData);
    }
    
    return {};
  };

  /**
   * Iniciar sesión con Google OAuth
   */
  const signInWithGoogle = async () => {
    const redirectUrl = getRedirectUrl();
    
    console.log('Google OAuth redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  };

  /**
   * Enviar magic link por email
   */
  const signInWithMagicLink = async (email: string) => {
    const redirectUrl = getRedirectUrl();
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    
    if (error) throw error;
  };

  /**
   * Restablecer contraseña
   */
  const resetPassword = async (email: string) => {
    const redirectUrl = getRedirectUrl('/auth/reset-password');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) throw error;
  };

  /**
   * Actualizar email del usuario
   */
  const updateEmail = async (newEmail: string) => {
    const redirectUrl = getRedirectUrl();
    
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    }, {
      emailRedirectTo: redirectUrl,
    });
    
    if (error) throw error;
  };

  /**
   * Cerrar sesión
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  /**
   * Reenviar email de confirmación
   */
  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });
    
    if (error) throw error;
  };

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithMagicLink,
    resetPassword,
    updateEmail,
    signOut,
    resendConfirmation,
  };
};
