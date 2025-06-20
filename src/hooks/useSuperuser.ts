
import { useStableAuth } from './useStableAuth';
import { useMemo } from 'react';

export const useSuperuser = () => {
  const { user } = useStableAuth();

  const isSuperuser = useMemo(() => {
    if (!user) return false;
    
    // Verificar desde metadata del usuario de auth
    const authMetadata = user.user_metadata || user.raw_user_meta_data || {};
    return authMetadata.is_superuser === 'true' || authMetadata.is_admin === 'true';
  }, [user]);

  return {
    isSuperuser,
    loading: false
  };
};
