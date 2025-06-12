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
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  hasAccess: (resource: string) => boolean;
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
    
    // Si el usuario se registró exitosamente, crear el tenant y usuario
    if (data.user) {
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

  const signInWithApple = async () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: redirectUrl,
      },
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
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
      signInWithApple,
      signOut,
      hasAccess,
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
