
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
    const isAuthSuperuser = authMetadata.is_superuser === 'true' || authMetadata.is_admin === 'true';
    
    // También verificar desde el profile (plan_type = 'superuser')
    // Esto se manejará en useProfile cuando esté disponible
    
    return isAuthSuperuser;
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
    onSuccess: (data: any) => {
      if (data?.success) {
        toast.success('Usuario convertido a superusuario exitosamente');
      } else {
        toast.error(data?.error || 'Error al convertir usuario');
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Crear cuenta de superuser de prueba
  const createSuperuserAccount = useMutation({
    mutationFn: async () => {
      const testEmail = 'superuser@trucking.dev';
      const testPassword = 'SuperUser123!@#';
      
      const { data, error } = await supabase.functions.invoke('create-superuser', {
        body: {
          email: testEmail,
          password: testPassword,
          nombre: 'Super Usuario',
          empresa: 'Sistema'
        }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        return {
          email: testEmail,
          password: data.password || testPassword,
          message: data.message
        };
      } else {
        throw new Error(data?.error || 'Error al crear superusuario');
      }
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
