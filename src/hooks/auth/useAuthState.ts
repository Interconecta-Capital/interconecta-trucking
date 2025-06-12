
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
  const { data: profileData } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return profile;
    },
    enabled: !!user?.id,
  });

  // Obtener datos del usuario y tenant desde la tabla usuarios
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

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
      return usuario;
    },
    enabled: !!user?.id,
  });

  // Configurar listeners de autenticación
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
        
        // Limpiar cache al cerrar sesión
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

  // Actualizar usuario con datos del perfil y tenant cuando estén disponibles
  useEffect(() => {
    if (user && (profileData || userData)) {
      setUser({
        ...user,
        profile: profileData,
        tenant: userData?.tenant,
        usuario: userData ? {
          id: userData.id,
          nombre: userData.nombre,
          rol: userData.rol,
        } : undefined,
      });
    }
  }, [user?.id, profileData, userData]);

  return {
    user,
    loading,
    setUser,
    queryClient
  };
};
