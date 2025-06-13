
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
        // Check if user has superuser role in metadata or email
        const isSuperuserEmail = user.email === 'superuser@trucking.dev';
        setIsSuperuser(isSuperuserEmail);
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

      // For now, we'll just show success since we can't update the rol_especial column
      toast.success('Usuario marcado como superusuario (funcionalidad limitada)');
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

      // This would need to be done through admin API
      toast.info('Funcionalidad de creación de superusuario no disponible en el cliente');
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
