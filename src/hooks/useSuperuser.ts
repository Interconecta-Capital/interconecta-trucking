
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useSuperuser = () => {
  const { user } = useAuth();
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if current user is a superuser
  const checkSuperuserStatus = useCallback(async () => {
    if (!user?.id) {
      setIsSuperuser(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('rol_especial')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking superuser status:', error);
        setIsSuperuser(false);
      } else {
        setIsSuperuser(data?.rol_especial === 'superuser');
      }
    } catch (error) {
      console.error('Error in superuser check:', error);
      setIsSuperuser(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Convert existing user to superuser (admin function)
  const convertToSuperuser = useCallback(async (email: string) => {
    try {
      // Get Enterprise plan
      const { data: plan, error: planError } = await supabase
        .from('planes_suscripcion')
        .select('id')
        .eq('nombre', 'Enterprise Sin Límites')
        .single();

      if (planError) {
        throw new Error('Enterprise plan not found');
      }

      // Update usuario to superuser
      const { error: userError } = await supabase
        .from('usuarios')
        .update({ rol_especial: 'superuser' })
        .eq('email', email);

      if (userError) throw userError;

      // Get user for subscription update
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('auth_user_id')
        .eq('email', email)
        .single();

      if (usuarioError) throw usuarioError;

      // Update or create subscription
      const { error: subscriptionError } = await supabase
        .from('suscripciones')
        .upsert({
          user_id: usuario.auth_user_id,
          plan_id: plan.id,
          status: 'active',
          fecha_inicio: new Date().toISOString(),
          fecha_vencimiento: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 100 years
          fecha_fin_prueba: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
        });

      if (subscriptionError) throw subscriptionError;

      toast.success(`Usuario ${email} convertido a superusuario exitosamente`);
      return true;
    } catch (error) {
      console.error('Error converting to superuser:', error);
      toast.error('Error al convertir usuario a superusuario');
      return false;
    }
  }, []);

  // Create superuser account (requires manual registration first)
  const createSuperuserAccount = useCallback(async () => {
    try {
      const email = 'superuser@trucking.dev';
      const password = 'SuperUser2024!';

      // First, register the user normally
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: 'Super Usuario Admin',
            empresa: 'Super Admin Company',
            rfc: 'SUPERADMIN001'
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          // User already exists, just convert to superuser
          const success = await convertToSuperuser(email);
          return success ? email : null;
        }
        throw error;
      }

      // Wait a moment for user creation to complete
      setTimeout(async () => {
        await convertToSuperuser(email);
      }, 2000);

      toast.success('Superusuario creado exitosamente');
      return email;
    } catch (error) {
      console.error('Error creating superuser:', error);
      toast.error('Error al crear superusuario');
      return null;
    }
  }, [convertToSuperuser]);

  useEffect(() => {
    checkSuperuserStatus();
  }, [checkSuperuserStatus]);

  return {
    isSuperuser,
    loading,
    convertToSuperuser,
    createSuperuserAccount,
    checkSuperuserStatus
  };
};
