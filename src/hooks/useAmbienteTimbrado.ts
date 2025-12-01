import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/utils/logger';
import { useState } from 'react';

export type AmbienteTimbrado = 'sandbox' | 'production';

export interface ConfiguracionTimbrado {
  ambiente: AmbienteTimbrado;
  urlPAC: string;
  modo_pruebas: boolean;
  proveedor_timbrado: 'smartweb';
}

interface ValidacionResult {
  success: boolean;
  message: string;
  details?: any;
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
  const queryClient = useQueryClient();
  const [estadoConexion, setEstadoConexion] = useState<'conectado' | 'error' | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['ambiente-timbrado'],
    queryFn: async (): Promise<ConfiguracionTimbrado> => {
      const { data: config, error } = await supabase
        .from('configuracion_empresa')
        .select('modo_pruebas, proveedor_timbrado')
        .single();

      if (error) {
        logger.error('timbrado', 'Error obteniendo configuración de ambiente', error);
        // Default seguro: sandbox para no consumir créditos accidentalmente
        return {
          ambiente: 'sandbox',
          urlPAC: 'https://services.test.sw.com.mx',
          modo_pruebas: true,
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
        modo_pruebas: config?.modo_pruebas ?? true,
        proveedor_timbrado: 'smartweb'
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  // Mutación para cambiar ambiente
  const cambiarAmbienteMutation = useMutation({
    mutationFn: async (nuevoAmbiente: AmbienteTimbrado) => {
      const modo_pruebas = nuevoAmbiente === 'sandbox';
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('configuracion_empresa')
        .update({ 
          modo_pruebas,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      logger.info('timbrado', 'Ambiente cambiado', { 
        nuevoAmbiente, 
        modo_pruebas 
      });

      return nuevoAmbiente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambiente-timbrado'] });
    }
  });

  // Función para validar conexión con PAC
  const validarConexionMutation = useMutation({
    mutationFn: async (): Promise<ValidacionResult> => {
      const ambiente = data?.ambiente || 'sandbox';
      
      const { data: response, error } = await supabase.functions.invoke('validar-pac', {
        body: { ambiente }
      });

      if (error) {
        setEstadoConexion('error');
        throw error;
      }

      if (response?.success) {
        setEstadoConexion('conectado');
      } else {
        setEstadoConexion('error');
      }

      return response;
    }
  });

  return {
    // Estado de configuración
    configuracion: data,
    ambiente: data?.ambiente || 'sandbox',
    urlPAC: data?.urlPAC || 'https://services.test.sw.com.mx',
    isLoading,
    error,
    isSandbox: data?.ambiente === 'sandbox',
    isProduction: data?.ambiente === 'production',
    
    // Cambio de ambiente
    cambiarAmbiente: cambiarAmbienteMutation.mutateAsync,
    isCambiandoAmbiente: cambiarAmbienteMutation.isPending,
    
    // Validación de conexión
    validarConexion: validarConexionMutation.mutateAsync,
    isValidando: validarConexionMutation.isPending,
    estadoConexion
  };
};
