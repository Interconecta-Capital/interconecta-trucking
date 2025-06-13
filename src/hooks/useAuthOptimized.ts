
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { queryClient } from '@/lib/queryClient';

export function useAuthOptimized() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Query optimizada para datos del usuario
  const { data: userData, isLoading: userDataLoading } = useQuery({
    queryKey: ['user-data'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Obtener solo los datos esenciales del usuario en una sola query
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at, trial_end_date, plan_type, nombre, email')
        .eq('id', session.user.id)
        .single();

      return {
        session,
        profile,
        user: session.user
      };
    },
    enabled: !!session,
    staleTime: 10 * 60 * 1000, // 10 minutos para datos de usuario
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Configurar listener de auth una sola vez
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH] State change:', event);
        setSession(session);
        setIsLoading(false);

        if (event === 'SIGNED_IN' && session) {
          // Invalidar cache solo cuando sea necesario
          queryClient.invalidateQueries({ queryKey: ['user-data'] });
        } else if (event === 'SIGNED_OUT') {
          // Limpiar todo el cache al cerrar sesión
          queryClient.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    session: userData?.session || session,
    user: userData?.user,
    profile: userData?.profile,
    isLoading: isLoading || userDataLoading,
  };
}
