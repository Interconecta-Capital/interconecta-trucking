
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
    if (user && user.profile) {
      const isIncomplete = 
        !user.profile.rfc || 
        !user.profile.telefono || 
        !user.profile.empresa ||
        !user.profile.nombre;
      
      setNeedsCompletion(isIncomplete);
    } else {
      setNeedsCompletion(false);
    }
  }, [user]);

  const checkIfUserIsUnconfirmed = (email: string) => {
    setUnconfirmedEmail(email);
    setShowUnconfirmedDialog(true);
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

  return { 
    needsCompletion,
    unconfirmedEmail,
    showUnconfirmedDialog,
    checkIfUserIsUnconfirmed,
    closeUnconfirmedDialog,
    handleVerificationSent
  };
};
