
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useOptimizedSuperuser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isSuperuser = false, isLoading } = useQuery({
    queryKey: ['superuser-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      try {
        // ✅ SECURE: Use server-side SECURITY DEFINER function
        const { data, error } = await supabase.rpc('is_superuser_secure', {
          _user_id: user.id
        });

        if (error) {
          console.error('[OptimizedSuperuser] Error:', error);
          return false;
        }

        return data === true;
      } catch (error) {
        console.error('[OptimizedSuperuser] Unexpected error:', error);
        return false;
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });

  const convertToSuperuserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Use secure RPC function instead of direct table update
      const { data, error } = await supabase.rpc('promote_user_to_superuser', {
        target_user_id: userId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Usuario convertido a superusuario exitosamente');
      queryClient.invalidateQueries({ queryKey: ['superuser-status'] });
    },
    onError: (error: any) => {
      toast.error(`Error al convertir usuario: ${error.message}`);
    },
  });

  const createSuperuserAccountMutation = useMutation({
    mutationFn: async () => {
      const email = 'superuser@trucking.dev';
      const password = Math.random().toString(36).slice(-12) + 'A1!';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: 'Superusuario',
            empresa: 'Sistema'
          }
        }
      });

      if (error) throw error;

      // Use secure RPC function to promote the newly created user
      if (data.user) {
        const { error: promoteError } = await supabase.rpc('promote_user_to_superuser', {
          target_user_id: data.user.id
        });
        
        if (promoteError) throw promoteError;
      }

      return { email, password };
    },
    onSuccess: () => {
      toast.success('Cuenta de superusuario creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['superuser-status'] });
    },
    onError: (error: any) => {
      toast.error(`Error al crear cuenta: ${error.message}`);
    },
  });

  const convertToSuperuser = (userId: string) => {
    convertToSuperuserMutation.mutate(userId);
  };

  const createSuperuserAccount = () => {
    return createSuperuserAccountMutation.mutateAsync();
  };

  return {
    isSuperuser,
    isLoading,
    convertToSuperuser,
    createSuperuserAccount,
    isConverting: convertToSuperuserMutation.isPending,
    isCreating: createSuperuserAccountMutation.isPending,
  };
};
