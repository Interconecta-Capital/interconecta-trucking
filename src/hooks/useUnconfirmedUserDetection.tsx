
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useUnconfirmedUserDetection = () => {
  const { user } = useAuth();
  const [needsCompletion, setNeedsCompletion] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [showUnconfirmedDialog, setShowUnconfirmedDialog] = useState(false);

  useEffect(() => {
    if (user) {
      // Verificar si el usuario está autenticado y tiene profile
      const checkProfile = async () => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
            return;
          }

          // Si no hay profile o faltan campos críticos
          const isIncomplete = !profile || 
            !profile.rfc || 
            !profile.telefono || 
            !profile.empresa ||
            !profile.nombre ||
            profile.rfc === '' ||
            profile.telefono === '' ||
            profile.empresa === '' ||
            profile.nombre === '';
          
          console.log('Profile check:', {
            hasProfile: !!profile,
            rfc: profile?.rfc,
            telefono: profile?.telefono,
            empresa: profile?.empresa,
            nombre: profile?.nombre,
            isIncomplete
          });
          
          setNeedsCompletion(isIncomplete);
          
          // Si el perfil está completo y el modal estaba abierto, cerrarlo
          if (!isIncomplete && needsCompletion) {
            console.log('✅ Perfil completado exitosamente, modal cerrado');
          }
        } catch (error) {
          console.error('Error checking profile completion:', error);
        }
      };

      checkProfile();
    } else {
      setNeedsCompletion(false);
    }
  }, [user, user?.profile, needsCompletion]);

  const checkIfUserIsUnconfirmed = (email: string, error?: any): boolean => {
    // Check if error indicates unconfirmed user
    if (error && (
      error.message?.includes('Email not confirmed') ||
      error.message?.includes('email_not_confirmed') ||
      error.message?.includes('signup_not_found')
    )) {
      setUnconfirmedEmail(email);
      setShowUnconfirmedDialog(true);
      return true;
    }
    return false;
  };

  const closeUnconfirmedDialog = () => {
    setShowUnconfirmedDialog(false);
    setUnconfirmedEmail(null);
  };

  const handleVerificationSent = async () => {
    if (!unconfirmedEmail) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) throw error;

      toast.success('Email de verificación enviado');
      closeUnconfirmedDialog();
    } catch (error: any) {
      toast.error('Error al enviar email de verificación: ' + error.message);
    }
  };

  // Función para validar RFC único
  const validateUniqueRFC = async (rfc: string): Promise<{ isValid: boolean; message?: string }> => {
    if (!rfc || !user) return { isValid: false, message: 'RFC requerido' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('rfc', rfc.toUpperCase())
        .neq('id', user.id) // Excluir el usuario actual
        .maybeSingle();

      if (error) {
        console.error('Error validating RFC:', error);
        return { isValid: false, message: 'Error al validar RFC' };
      }

      if (data) {
        return { 
          isValid: false, 
          message: `Este RFC ya está registrado por otro usuario (${data.email})` 
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating RFC:', error);
      return { isValid: false, message: 'Error al validar RFC' };
    }
  };

  return { 
    needsCompletion,
    unconfirmedEmail,
    showUnconfirmedDialog,
    checkIfUserIsUnconfirmed,
    closeUnconfirmedDialog,
    handleVerificationSent,
    validateUniqueRFC
  };
};
