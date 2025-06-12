
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

  // Obtener datos del perfil y tenant desde la base de datos
  const { data: profileData, refetch: refetchProfile, isLoading: profileLoading } = useQuery({
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
        .single();

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
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Obtener datos del usuario y tenant desde la tabla usuarios
  const { data: userData, isLoading: userDataLoading } = useQuery({
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
        .single();

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
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Configurar listeners de autenticación
  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        
        setUser(session?.user ?? null);
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

    return () => subscription.unsubscribe();
  }, [queryClient, refetchProfile]);

  // Mantener los datos del usuario actualizados de forma más eficiente
  useEffect(() => {
    if (user && (profileData !== undefined || userData !== undefined)) {
      const updatedUser: AuthUser = {
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
      };
      
      setUser(updatedUser);
    }
  }, [user?.id, profileData, userData]);

  // Función para refrescar datos manualmente
  const refreshUserData = async () => {
    await Promise.all([refetchProfile()]);
  };

  return {
    user,
    loading: loading || profileLoading || userDataLoading,
    setUser,
    queryClient,
    refreshUserData
  };
};
