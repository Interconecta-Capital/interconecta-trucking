
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useSuperuser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const convertToSuperuserMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!email.trim()) {
        throw new Error('Email es requerido');
      }

      // Buscar el usuario por email
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('auth_user_id, nombre')
        .eq('email', email.trim())
        .maybeSingle();

      if (userError) {
        throw new Error(`Error al buscar usuario: ${userError.message}`);
      }

      if (!userData) {
        throw new Error('Usuario no encontrado');
      }

      // Actualizar el rol especial
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ rol_especial: 'superuser' })
        .eq('auth_user_id', userData.auth_user_id);

      if (updateError) {
        throw new Error(`Error al convertir usuario: ${updateError.message}`);
      }

      return { email, nombre: userData.nombre };
    },
    onSuccess: (data) => {
      toast.success(`Usuario ${data.nombre} convertido a superusuario exitosamente`);
      queryClient.invalidateQueries({ queryKey: ['superuser-status'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const createSuperuserAccountMutation = useMutation({
    mutationFn: async () => {
      // Generar contraseña segura
      const password = Array.from({ length: 16 }, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
        .charAt(Math.floor(Math.random() * 70))
      ).join('');

      const email = 'superuser@trucking.dev';

      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nombre: 'Superusuario',
          empresa: 'Trucking System'
        }
      });

      if (authError) {
        throw new Error(`Error al crear usuario: ${authError.message}`);
      }

      // Crear perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          nombre: 'Superusuario',
          email,
          empresa: 'Trucking System'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Crear usuario con rol especial
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          auth_user_id: authData.user.id,
          email,
          nombre: 'Superusuario',
          rol: 'admin',
          rol_especial: 'superuser',
          tenant_id: '00000000-0000-0000-0000-000000000000'
        });

      if (usuarioError) {
        throw new Error(`Error al crear registro de usuario: ${usuarioError.message}`);
      }

      return { email, password };
    },
    onSuccess: () => {
      toast.success('Cuenta de superusuario creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['superuser-status'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
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
    isCreating: createSuperuserAccountMutation.isPending
  };
};
