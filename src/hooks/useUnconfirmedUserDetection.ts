
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthError {
  message: string;
  status?: number;
}

export const useUnconfirmedUserDetection = () => {
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string>('');
  const [showUnconfirmedDialog, setShowUnconfirmedDialog] = useState(false);

  const checkIfUserIsUnconfirmed = useCallback(async (email: string, error: AuthError) => {
    // Check if error indicates unconfirmed email
    const isUnconfirmedError = 
      error.message?.toLowerCase().includes('email not confirmed') ||
      error.message?.toLowerCase().includes('confirm') ||
      error.message?.toLowerCase().includes('verification');

    if (isUnconfirmedError || error.message?.toLowerCase().includes('invalid')) {
      // Try to check if user exists but is unconfirmed
      try {
        // This will tell us if the user exists but is unconfirmed
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: 'dummy-password-for-check' // Won't be used
        });

        if (signUpError?.message.includes('already registered')) {
          // User exists but might be unconfirmed
          setUnconfirmedEmail(email);
          setShowUnconfirmedDialog(true);
          return true;
        }
      } catch (checkError) {
        console.error('Error checking user status:', checkError);
      }
    }
    
    return false;
  }, []);

  const resendConfirmationEmail = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Error resending confirmation:', error);
        toast.error('Error al reenviar el correo de confirmación');
        return false;
      }

      toast.success('Correo de confirmación reenviado');
      return true;
    } catch (error) {
      console.error('Error resending confirmation:', error);
      toast.error('Error inesperado al reenviar confirmación');
      return false;
    }
  }, []);

  const closeUnconfirmedDialog = useCallback(() => {
    setShowUnconfirmedDialog(false);
    setUnconfirmedEmail('');
  }, []);

  const handleVerificationSent = useCallback(() => {
    setShowUnconfirmedDialog(false);
    toast.success('Correo de verificación enviado. Revisa tu bandeja de entrada.');
  }, []);

  return {
    unconfirmedEmail,
    showUnconfirmedDialog,
    checkIfUserIsUnconfirmed,
    resendConfirmationEmail,
    closeUnconfirmedDialog,
    handleVerificationSent
  };
};
