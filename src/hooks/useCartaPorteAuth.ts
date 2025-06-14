
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useCartaPorteAuth = () => {
  const { user } = useAuth();
  const [canCreate, setCanCreate] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setCanCreate(false);
        setCanUpdate(false);
        setAuthError('Usuario no autenticado');
        return;
      }

      try {
        // Test if user can create records
        const { error: createError } = await supabase
          .from('cartas_porte')
          .insert({
            rfc_emisor: 'TEST',
            rfc_receptor: 'TEST',
            status: 'test'
          })
          .select()
          .limit(0); // Don't actually insert

        setCanCreate(!createError);

        // Test if user can update records (if they have any)
        const { error: updateError } = await supabase
          .from('cartas_porte')
          .update({ updated_at: new Date().toISOString() })
          .eq('usuario_id', user.id)
          .limit(0); // Don't actually update

        setCanUpdate(!updateError);
        setAuthError(null);
      } catch (error: any) {
        console.error('Error checking permissions:', error);
        setAuthError(error.message);
        setCanCreate(false);
        setCanUpdate(false);
      }
    };

    checkPermissions();
  }, [user]);

  return {
    canCreate,
    canUpdate,
    authError,
    user,
  };
};
