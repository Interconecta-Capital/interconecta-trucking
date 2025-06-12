import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AuthUser extends User {
  tenant?: {
    id: string;
    nombre_empresa: string;
    rfc_empresa: string;
  };
  usuario?: {
    id: string;
    nombre: string;
    rol: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<{ needsVerification?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  hasAccess: (resource: string) => boolean;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Obtener datos del usuario y tenant
  const { data: userData } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          tenant:tenants(*)
        `)
        .eq('auth_user_id', user.id)
        .single();

      if (error) throw error;
      return usuario;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email_confirmed_at);
        
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          queryClient.clear();
        }
        
        // Manejar usuarios OAuth nuevos
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            await handleOAuthUser(session.user);
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Actualizar usuario con datos del tenant
  useEffect(() => {
    if (user && userData) {
      setUser({
        ...user,
        tenant: userData.tenant,
        usuario: {
          id: userData.id,
          nombre: userData.nombre,
          rol: userData.rol,
        },
      });
    }
  }, [user?.id, userData]);

  const handleOAuthUser = async (oauthUser: User) => {
    try {
      // Verificar si el usuario ya existe en nuestra tabla
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', oauthUser.id)
        .single();

      if (!existingUser) {
        // Es un usuario OAuth nuevo, necesita completar información
        // Por ahora crearemos un tenant básico, pero esto puede mejorarse
        // para mostrar un modal de registro adicional
        const email = oauthUser.email || '';
        const name = oauthUser.user_metadata?.full_name || 
                    oauthUser.user_metadata?.name || 
                    email.split('@')[0];
        
        // Crear tenant básico
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .insert({
            nombre_empresa: `${name} - Empresa`,
            rfc_empresa: 'TEMP000000000', // Temporal, el usuario deberá actualizarlo
          })
          .select()
          .single();

        if (tenantError) throw tenantError;

        // Crear usuario en la tabla usuarios
        const { error: usuarioError } = await supabase
          .from('usuarios')
          .insert({
            auth_user_id: oauthUser.id,
            email: email,
            nombre: name,
            tenant_id: tenant.id,
            rol: 'admin',
          });

        if (usuarioError) throw usuarioError;
      }
    } catch (error) {
      console.error('Error handling OAuth user:', error);
    }
  };

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

  const signInWithMagicLink = async (email: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData,
      },
    });
    
    if (error) throw error;
    
    // Si el usuario se registró exitosamente pero necesita confirmar email
    if (data.user && !data.user.email_confirmed_at) {
      console.log('Usuario creado, necesita confirmación por email');
      return { needsVerification: true };
    }
    
    // Si el usuario se registró exitosamente y ya está confirmado, crear el tenant y usuario
    if (data.user && data.user.email_confirmed_at) {
      try {
        // Crear tenant
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .insert({
            nombre_empresa: userData.empresa,
            rfc_empresa: userData.rfc,
          })
          .select()
          .single();

        if (tenantError) throw tenantError;

        // Crear usuario en la tabla usuarios
        const { error: usuarioError } = await supabase
          .from('usuarios')
          .insert({
            auth_user_id: data.user.id,
            email: email,
            nombre: userData.nombre,
            tenant_id: tenant.id,
            telefono: userData.telefono,
            empresa: userData.empresa,
            rol: 'admin',
          });

        if (usuarioError) throw usuarioError;
      } catch (dbError) {
        console.error('Error creating tenant/user:', dbError);
      }
    }
    
    return {};
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) throw error;
  };

  const updateEmail = async (newEmail: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    }, {
      emailRedirectTo: redirectUrl,
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    
    if (error) throw error;
  };

  const hasAccess = (resource: string) => {
    if (!user?.usuario?.rol) return false;
    
    // Lógica de permisos básica
    const rol = user.usuario.rol;
    if (rol === 'admin') return true;
    if (rol === 'usuario' && resource !== 'admin') return true;
    
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithMagicLink,
      signOut,
      resetPassword,
      updateEmail,
      hasAccess,
      resendConfirmation,
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
