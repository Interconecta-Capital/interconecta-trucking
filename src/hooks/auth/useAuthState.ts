
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

  // Obtener datos del usuario y tenant desde la base de datos
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

  // Actualizar usuario con datos del tenant cuando estén disponibles
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

  return {
    user,
    loading,
    setUser,
    queryClient
  };
};
