
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from './types';
import { handleOAuthUser } from './useAuthUtils';

/**
 * Hook personalizado para manejar el estado de autenticación
 * Gestiona la sesión, el usuario actual y los datos relacionados
 */
export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Obtener datos del perfil desde la base de datos
  const { data: profileData, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching profile for user:', user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id,
          nombre,
          email,
          empresa,
          rfc,
          telefono,
          avatar_url,
          created_at,
          updated_at
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      console.log('Profile data loaded:', profile);
      return profile;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Obtener datos del usuario y tenant desde la tabla usuarios
  const { data: userData } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching user data for:', user.id);
      
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nombre,
          email,
          rol,
          activo,
          tenant_id,
          tenant:tenants(
            id,
            nombre_empresa,
            rfc_empresa,
            activo
          )
        `)
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
      
      console.log('User data loaded:', usuario);
      return usuario;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Configurar listeners de autenticación
  useEffect(() => {
    let mounted = true;

    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session:', session?.user?.email);
      const authUser = session?.user;
      
      if (authUser) {
        const baseUser: AuthUser = {
          ...authUser,
          profile: null,
          tenant: null,
          usuario: undefined,
        };
        setUser(baseUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth event:', event, session?.user?.email);
        
        const authUser = session?.user;
        
        if (authUser) {
          const baseUser: AuthUser = {
            ...authUser,
            profile: null,
            tenant: null,
            usuario: undefined,
          };
          setUser(baseUser);
        } else {
          setUser(null);
        }
        
        setLoading(false);
        
        // Limpiar cache al cerrar sesión
        if (event === 'SIGNED_OUT') {
          queryClient.clear();
        }
        
        // Manejar usuarios OAuth nuevos
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            await handleOAuthUser(session.user);
            // Refetch profile data después de manejar usuario OAuth
            refetchProfile();
          }, 100);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient, refetchProfile]);

  // Crear el usuario completo con datos adicionales cuando estén disponibles
  const fullUser: AuthUser | null = user ? {
    ...user,
    profile: profileData || {
      id: user.id,
      nombre: user.user_metadata?.nombre || user.user_metadata?.name || 'Usuario',
      email: user.email || '',
      empresa: user.user_metadata?.empresa || '',
      rfc: user.user_metadata?.rfc || '',
      telefono: user.user_metadata?.telefono || '',
    },
    tenant: userData?.tenant || null,
    usuario: userData ? {
      id: userData.id,
      nombre: userData.nombre,
      rol: userData.rol,
    } : undefined,
  } : null;

  console.log('Current full user state:', fullUser?.email, {
    hasProfile: !!fullUser?.profile,
    hasTenant: !!fullUser?.tenant,
    hasUsuario: !!fullUser?.usuario
  });

  return {
    user: fullUser,
    loading,
    setUser,
    queryClient
  };
};
