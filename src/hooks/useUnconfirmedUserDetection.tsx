import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUnconfirmedUserDetection() {
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [showUnconfirmedDialog, setShowUnconfirmedDialog] = useState(false);

  const checkIfUserIsUnconfirmed = async (email: string, originalError: any) => {
    // Check if the error indicates an unconfirmed user
    if (originalError?.message?.includes('Email not confirmed') || 
        originalError?.message?.includes('verifica tu correo') ||
        originalError?.message?.includes('Please verify')) {
      
      setUnconfirmedEmail(email);
      setShowUnconfirmedDialog(true);
      return true;
    }

    // If login fails with "Invalid login credentials", check if user exists but is unconfirmed
    if (originalError?.message?.includes('Invalid login credentials')) {
      try {
        // Try to trigger a password reset to see if the email exists
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        
        // If no error on reset, the email exists - likely unconfirmed
        if (!resetError) {
          setUnconfirmedEmail(email);
          setShowUnconfirmedDialog(true);
          return true;
        }
      } catch (checkError) {
        // If this fails, continue with original error
        console.log('User check failed:', checkError);
      }
    }
    
    return false;
  };

  const closeUnconfirmedDialog = () => {
    setShowUnconfirmedDialog(false);
    setUnconfirmedEmail(null);
  };

  const handleVerificationSent = () => {
    setShowUnconfirmedDialog(false);
    // Keep the email for potential future use
  };

  return {
    unconfirmedEmail,
    showUnconfirmedDialog,
    checkIfUserIsUnconfirmed,
    closeUnconfirmedDialog,
    handleVerificationSent,
  };
}
