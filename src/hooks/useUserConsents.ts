import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserConsent {
  id: string;
  user_id: string;
  consent_type: 'privacy_policy' | 'terms_of_service';
  version: string;
  consented_at: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Hook para obtener el historial de consentimientos del usuario
 * Implementa GDPR Art. 13 - Derecho a conocer el tratamiento de datos
 */
export const useUserConsents = () => {
  const { user } = useAuth();
  
  return useQuery<UserConsent[]>({
    queryKey: ['user-consents', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', user.id)
        .order('consented_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user consents:', error);
        throw error;
      }
      
      return data as UserConsent[];
    },
    enabled: !!user?.id,
  });
};
