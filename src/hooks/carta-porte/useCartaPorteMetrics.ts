import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';

export interface CartaPorteMetrics {
  cartasCreadas: number;
  timbresConsumidos: number;
}

export function useCartaPorteMetrics() {
  const { user } = useAuth();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['carta-porte-metrics', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('cartas_porte_creadas, timbres_consumidos')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return {
        cartasCreadas: data?.cartas_porte_creadas || 0,
        timbresConsumidos: data?.timbres_consumidos || 0
      } as CartaPorteMetrics;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000 // Refrescar cada minuto
  });

  return {
    metrics,
    isLoading,
    error
  };
}
