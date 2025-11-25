import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/utils/logger';

export type AmbienteTimbrado = 'sandbox' | 'production';

export interface ConfiguracionTimbrado {
  ambiente: AmbienteTimbrado;
  urlPAC: string;
  modo_pruebas: boolean;
  proveedor_timbrado: 'smartweb';
}

/**
 * Hook para ambiente de timbrado dinámico con configuración completa
 * Lee modo_pruebas desde configuracion_empresa
 * 
 * - Si modo_pruebas = true → 'sandbox' (pruebas con RFC de prueba)
 * - Si modo_pruebas = false → 'production' (timbrado real)
 * 
 * @returns Configuración completa de timbrado con URLs y ambiente
 */
export const useAmbienteTimbrado = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ambiente-timbrado'],
    queryFn: async (): Promise<ConfiguracionTimbrado> => {
      const { data: config, error } = await supabase
        .from('configuracion_empresa')
        .select('modo_pruebas, proveedor_timbrado')
        .single();

      if (error) {
        logger.error('timbrado', 'Error obteniendo configuración de ambiente', error);
        // Default seguro: producción
        return {
          ambiente: 'production',
          urlPAC: 'https://services.sw.com.mx',
          modo_pruebas: false,
          proveedor_timbrado: 'smartweb'
        };
      }

      const ambiente: AmbienteTimbrado = config?.modo_pruebas ? 'sandbox' : 'production';
      const urlPAC = ambiente === 'sandbox' 
        ? 'https://services.test.sw.com.mx'
        : 'https://services.sw.com.mx';

      logger.info('timbrado', 'Ambiente configurado', { 
        ambiente, 
        urlPAC,
        modo_pruebas: config?.modo_pruebas 
      });

      return {
        ambiente,
        urlPAC,
        modo_pruebas: config?.modo_pruebas || false,
        proveedor_timbrado: 'smartweb'
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  return {
    configuracion: data,
    ambiente: data?.ambiente || 'production',
    urlPAC: data?.urlPAC || 'https://services.sw.com.mx',
    isLoading,
    error,
    isSandbox: data?.ambiente === 'sandbox',
    isProduction: data?.ambiente === 'production'
  };
};
