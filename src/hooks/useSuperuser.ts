
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSuperuser = () => {
  const { user } = useAuth();

  const { data: isSuperuser = false, isLoading } = useQuery({
    queryKey: ['superuser-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        console.log('[useSuperuser] Checking superuser status for user:', user.id);
        
        // Usar .maybeSingle() en lugar de .single() para evitar errores
        const { data, error } = await supabase
          .from('usuarios')
          .select('rol_especial')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('[useSuperuser] Error checking superuser status:', error);
          return false;
        }

        // Si no hay datos, devolver false sin error
        if (!data) {
          console.log('[useSuperuser] No usuario data found, not a superuser');
          return false;
        }

        const result = data.rol_especial === 'superuser';
        console.log('[useSuperuser] Superuser check result:', result);
        return result;
      } catch (error) {
        console.error('[useSuperuser] Unexpected error:', error);
        return false;
      }
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutos - aumentado significativamente
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false, // Deshabilitar polling completamente
    retry: false, // No hacer retry en caso de error
  });

  return {
    isSuperuser,
    isLoading,
  };
};
