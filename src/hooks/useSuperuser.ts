
import { useState, useEffect } from 'react';
import { useSimpleAuth } from './useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSuperuser = () => {
  const { user } = useSimpleAuth();
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSuperuserStatus = async () => {
      if (!user?.id) {
        setIsSuperuser(false);
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('rol_especial')
          .eq('id', user.id)
          .single();

        setIsSuperuser(profile?.rol_especial === 'superuser');
      } catch (error) {
        console.error('Error checking superuser status:', error);
        setIsSuperuser(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperuserStatus();
  }, [user?.id]);

  const convertToSuperuser = async (email: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (!profile) {
        toast.error('Usuario no encontrado');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ rol_especial: 'superuser' })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Usuario convertido a superusuario exitosamente');
      return true;
    } catch (error) {
      console.error('Error converting to superuser:', error);
      toast.error('Error al convertir usuario');
      return false;
    }
  };

  const createSuperuserAccount = async () => {
    try {
      const email = 'superuser@trucking.dev';
      const password = 'SuperUser2024!';

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          nombre: 'Super Usuario',
          empresa: 'Trucking Admin',
          rol_especial: 'superuser'
        },
        email_confirm: true
      });

      if (error) throw error;

      if (data.user) {
        await supabase
          .from('profiles')
          .update({ rol_especial: 'superuser' })
          .eq('id', data.user.id);
      }

      return email;
    } catch (error) {
      console.error('Error creating superuser:', error);
      toast.error('Error al crear superusuario');
      return null;
    }
  };

  return {
    isSuperuser,
    loading,
    convertToSuperuser,
    createSuperuserAccount
  };
};
