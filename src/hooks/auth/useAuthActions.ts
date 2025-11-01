
import { supabase } from '@/integrations/supabase/client';
import { UserSignUpData, UserProfile } from './types';
import { getRedirectUrl } from './useAuthUtils';

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
   * El trigger de base de datos handle_new_user se encarga de crear tenant/usuario/perfil
   */
  const signUp = async (email: string, password: string, userData: UserSignUpData) => {
    const redirectUrl = getRedirectUrl();
    
    console.log('[Auth] Iniciando registro de usuario:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData,
      },
    });
    
    if (error) {
      console.error('[Auth] Error en registro:', error);
      // Detectar si el usuario ya existe y lanzar error específico
      if (error.message?.includes('User already registered')) {
        throw new Error('El correo electrónico ya está registrado. Por favor inicia sesión.');
      }
      throw error;
    }
    
    // Si el usuario se registró exitosamente pero necesita confirmar email
    if (data.user && !data.user.email_confirmed_at) {
      console.log('[Auth] Usuario creado exitosamente, requiere confirmación por email');
      return { needsVerification: true };
    }
    
    // Si el usuario se registró y ya está confirmado (confirmación instantánea)
    // El trigger handle_new_user ya creó todo automáticamente
    if (data.user && data.user.email_confirmed_at) {
      console.log('[Auth] Usuario creado y confirmado automáticamente');
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
   * Actualizar perfil del usuario
   */
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;
  };

  /**
   * Cerrar sesión y redirigir a /auth
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Redirigir a la página de autenticación
    window.location.href = '/auth';
  };

  /**
   * Reenviar email de confirmación
   */
  const resendConfirmation = async (email: string) => {
    console.log('[Auth] Enviando email de confirmación a:', email);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });
    
    if (error) {
      console.error('[Auth] Error al enviar confirmación:', error.message);
      
      // Detectar rate limit
      if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
        throw new Error('Has alcanzado el límite de intentos. Por favor espera 60 segundos antes de intentar de nuevo.');
      }
      
      throw error;
    }
    
    console.log('[Auth] Email de confirmación enviado exitosamente');
  };

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithMagicLink,
    resetPassword,
    updateEmail,
    updateProfile,
    signOut,
    resendConfirmation,
  };
};
