
import { useStableAuth } from './useStableAuth';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMemo } from 'react';

export const useSuperuser = () => {
  const { user } = useStableAuth();

  const isSuperuser = useMemo(() => {
    if (!user) return false;
    
    // Verificar desde metadata del usuario de auth
    const authMetadata = user.user_metadata || {};
    return authMetadata.is_superuser === 'true' || authMetadata.is_admin === 'true';
  }, [user]);

  // Convertir usuario existente a superuser
  const convertToSuperuser = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.functions.invoke('convert-to-superuser', {
        body: { email }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Usuario convertido a superusuario exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Crear cuenta de superuser de prueba
  const createSuperuserAccount = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-test-superuser');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Cuenta de superusuario de prueba creada');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  return {
    isSuperuser,
    loading: false,
    convertToSuperuser: convertToSuperuser.mutate,
    createSuperuserAccount: createSuperuserAccount.mutateAsync,
    isConverting: convertToSuperuser.isPending,
    isCreating: createSuperuserAccount.isPending
  };
};
