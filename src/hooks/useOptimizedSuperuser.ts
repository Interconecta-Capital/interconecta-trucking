
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
      
      if (user.usuario?.rol_especial === 'superuser') {
        return true;
      }

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
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });

  const convertToSuperuserMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase
        .from('usuarios')
        .update({ rol_especial: 'superuser' })
        .eq('email', email)
        .select()
        .single();

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
            empresa: 'Sistema',
            rol_especial: 'superuser'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        await supabase
          .from('usuarios')
          .update({ rol_especial: 'superuser' })
          .eq('auth_user_id', data.user.id);
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

  const convertToSuperuser = (email: string) => {
    convertToSuperuserMutation.mutate(email);
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
