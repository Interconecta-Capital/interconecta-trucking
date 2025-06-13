
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
      // Query using a safer approach - check if column exists first
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking superuser status:', error);
        setIsSuperuser(false);
      } else {
        // Check if the user has superuser role (when the column exists)
        const hasSpecialRole = (data as any)?.rol_especial === 'superuser';
        setIsSuperuser(hasSpecialRole);
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

      // Update usuario to superuser using generic update
      const { error: userError } = await supabase
        .from('usuarios')
        .update({ rol_especial: 'superuser' } as any)
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

  // Generate secure random password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Create superuser account with secure credentials
  const createSuperuserAccount = useCallback(async () => {
    try {
      const email = 'superuser@trucking.dev';
      const securePassword = generateSecurePassword();

      // First, register the user normally
      const { data, error } = await supabase.auth.signUp({
        email,
        password: securePassword,
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
      // Return both email and password for one-time display
      return { email, password: securePassword };
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
