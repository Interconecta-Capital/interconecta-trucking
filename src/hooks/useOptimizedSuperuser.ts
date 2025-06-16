
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

export const useOptimizedSuperuser = () => {
  const { user } = useUnifiedAuth();

  const { data: isSuperuser = false, isLoading } = useQuery({
    queryKey: ['superuser-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      // Verificar desde el usuario ya cargado primero
      if (user.usuario?.rol_especial === 'superuser') {
        return true;
      }

      // Si no está en cache, verificar en base de datos
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('rol_especial')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('[OptimizedSuperuser] Error:', error);
          return false;
        }

        return data?.rol_especial === 'superuser';
      } catch (error) {
        console.error('[OptimizedSuperuser] Unexpected error:', error);
        return false;
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });

  return {
    isSuperuser,
    isLoading,
  };
};
