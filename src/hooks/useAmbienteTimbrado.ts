import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AmbienteTimbrado = 'sandbox' | 'production';

/**
 * Hook para determinar el ambiente de timbrado dinámicamente
 * Lee modo_pruebas desde configuracion_empresa
 * 
 * - Si modo_pruebas = true → 'sandbox' (solo superusers)
 * - Si modo_pruebas = false → 'production' (usuarios regulares)
 */
export const useAmbienteTimbrado = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ambiente-timbrado'],
    queryFn: async (): Promise<AmbienteTimbrado> => {
      const { data: config, error } = await supabase
        .from('configuracion_empresa')
        .select('modo_pruebas')
        .single();

      if (error) {
        console.error('❌ [useAmbienteTimbrado] Error obteniendo configuración:', error);
        // Default seguro: producción
        return 'production';
      }

      const ambiente = config?.modo_pruebas ? 'sandbox' : 'production';
      
      console.log('🌍 [useAmbienteTimbrado] Ambiente determinado:', {
        modo_pruebas: config?.modo_pruebas,
        ambiente
      });

      return ambiente;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  return {
    ambiente: data || 'production',
    isLoading,
    error,
    isSandbox: data === 'sandbox',
    isProduction: data === 'production'
  };
};
