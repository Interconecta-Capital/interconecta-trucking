
import { useMemo } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';

interface OptimizedFormDataOptions {
  enableMemoization?: boolean;
  cacheTimeout?: number;
}

interface CacheStats {
  total: number;
  active: number;
  expired: number;
  hitRate: number;
}

export const useOptimizedFormData = (
  formData: CartaPorteData, 
  options: OptimizedFormDataOptions = {}
) => {
  const { enableMemoization = true, cacheTimeout = 5000 } = options;

  const optimizedConfiguracion = useMemo(() => {
    return {
      tipoCreacion: formData.tipoCreacion || 'manual',
      tipoCfdi: formData.tipoCfdi || 'Traslado',
      rfcEmisor: formData.rfcEmisor || '',
      nombreEmisor: formData.nombreEmisor || '',
      rfcReceptor: formData.rfcReceptor || '',
      nombreReceptor: formData.nombreReceptor || '',
      transporteInternacional: formData.transporteInternacional || 'No',
      cartaPorteVersion: formData.cartaPorteVersion || '3.1'
    };
  }, [
    formData.tipoCreacion,
    formData.tipoCfdi,
    formData.rfcEmisor,
    formData.nombreEmisor,
    formData.rfcReceptor,
    formData.nombreReceptor,
    formData.transporteInternacional,
    formData.cartaPorteVersion
  ]);

  const optimizedUbicaciones = useMemo(() => {
    return formData.ubicaciones || [];
  }, [formData.ubicaciones]);

  const optimizedMercancias = useMemo(() => {
    return formData.mercancias || [];
  }, [formData.mercancias]);

  const optimizedAutotransporte = useMemo(() => {
    return formData.autotransporte || {
      placa_vm: '',
      anio_modelo_vm: new Date().getFullYear(),
      config_vehicular: '',
      perm_sct: '',
      num_permiso_sct: '',
      asegura_resp_civil: '',
      poliza_resp_civil: ''
    };
  }, [formData.autotransporte]);

  const optimizedFiguras = useMemo(() => {
    return formData.figuras || [];
  }, [formData.figuras]);

  const clearCache = () => {
    // Mock implementation for cache clearing
    console.log('Cache cleared');
  };

  const getCacheStats = (): CacheStats => {
    // Mock implementation for cache stats
    return {
      total: 5,
      active: 3,
      expired: 2,
      hitRate: 85
    };
  };

  return {
    optimizedConfiguracion,
    optimizedUbicaciones,
    optimizedMercancias,
    optimizedAutotransporte,
    optimizedFiguras,
    clearCache,
    getCacheStats
  };
};
