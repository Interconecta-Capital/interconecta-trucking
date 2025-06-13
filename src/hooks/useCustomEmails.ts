
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailData {
  nombre?: string;
  dashboardUrl?: string;
  confirmationUrl?: string;
  resetUrl?: string;
}

export function useCustomEmails() {
  const sendCustomEmail = useCallback(async (
    to: string,
    template: 'welcome' | 'verification' | 'password-reset',
    data: EmailData = {}
  ) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-custom-email', {
        body: {
          to,
          template,
          data: {
            ...data,
            dashboardUrl: `${window.location.origin}/dashboard`
          }
        }
      });

      if (error) {
        console.error('Error enviando email personalizado:', error);
        return false;
      }

      console.log('Email personalizado enviado:', result);
      return true;
    } catch (error) {
      console.error('Error en useCustomEmails:', error);
      return false;
    }
  }, []);

  const sendWelcomeEmail = useCallback(async (email: string, nombre: string) => {
    const success = await sendCustomEmail(email, 'welcome', { nombre });
    if (success) {
      toast.success('Email de bienvenida enviado');
    }
    return success;
  }, [sendCustomEmail]);

  const sendVerificationEmail = useCallback(async (email: string, nombre: string, confirmationUrl: string) => {
    const success = await sendCustomEmail(email, 'verification', { nombre, confirmationUrl });
    if (success) {
      toast.success('Email de verificación enviado');
    }
    return success;
  }, [sendCustomEmail]);

  const sendPasswordResetEmail = useCallback(async (email: string, nombre: string, resetUrl: string) => {
    const success = await sendCustomEmail(email, 'password-reset', { nombre, resetUrl });
    if (success) {
      toast.success('Email de recuperación enviado');
    }
    return success;
  }, [sendCustomEmail]);

  return {
    sendCustomEmail,
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail
  };
}
