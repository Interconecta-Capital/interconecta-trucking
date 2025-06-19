
import { useMemo, useCallback, useRef } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hash: string;
}

interface UseOptimizedFormDataOptions {
  cacheTimeout?: number;
  enableMemoization?: boolean;
}

export const useOptimizedFormData = (
  formData: CartaPorteData,
  options: UseOptimizedFormDataOptions = {}
) => {
  const { cacheTimeout = 5000, enableMemoization = true } = options;
  const cache = useRef<Map<string, CacheEntry<any>>>(new Map());

  // Generar hash estable de los datos
  const generateDataHash = useCallback((data: any): string => {
    return JSON.stringify(data, Object.keys(data).sort()).slice(0, 100);
  }, []);

  // Función de memoización con TTL
  const memoizeData = useCallback(<T>(key: string, computeFn: () => T): T => {
    if (!enableMemoization) {
      return computeFn();
    }

    const now = Date.now();
    const cached = cache.current.get(key);
    
    if (cached && (now - cached.timestamp) < cacheTimeout) {
      return cached.data;
    }

    const result = computeFn();
    const hash = generateDataHash(result);
    
    cache.current.set(key, {
      data: result,
      timestamp: now,
      hash
    });

    // Limpiar entradas expiradas
    for (const [k, v] of cache.current.entries()) {
      if ((now - v.timestamp) >= cacheTimeout) {
        cache.current.delete(k);
      }
    }

    return result;
  }, [cacheTimeout, enableMemoization, generateDataHash]);

  // Configuración optimizada con memoización
  const optimizedConfiguracion = useMemo(() => 
    memoizeData('configuracion', () => ({
      tipoCreacion: formData.tipoCreacion,
      tipoCfdi: formData.tipoCfdi,
      rfcEmisor: formData.rfcEmisor,
      nombreEmisor: formData.nombreEmisor,
      rfcReceptor: formData.rfcReceptor,
      nombreReceptor: formData.nombreReceptor,
      transporteInternacional: formData.transporteInternacional,
      registroIstmo: formData.registroIstmo,
      cartaPorteVersion: formData.cartaPorteVersion
    }))
  , [formData.tipoCreacion, formData.tipoCfdi, formData.rfcEmisor, formData.nombreEmisor, formData.rfcReceptor, formData.nombreReceptor, formData.transporteInternacional, formData.registroIstmo, formData.cartaPorteVersion, memoizeData]);

  // Ubicaciones optimizadas
  const optimizedUbicaciones = useMemo(() => 
    memoizeData('ubicaciones', () => formData.ubicaciones || [])
  , [formData.ubicaciones, memoizeData]);

  // Mercancías optimizadas
  const optimizedMercancias = useMemo(() => 
    memoizeData('mercancias', () => formData.mercancias || [])
  , [formData.mercancias, memoizeData]);

  // Autotransporte optimizado
  const optimizedAutotransporte = useMemo(() => 
    memoizeData('autotransporte', () => formData.autotransporte || {})
  , [formData.autotransporte, memoizeData]);

  // Figuras optimizadas
  const optimizedFiguras = useMemo(() => 
    memoizeData('figuras', () => formData.figuras || [])
  , [formData.figuras, memoizeData]);

  // Función para limpiar cache
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  // Función para obtener estadísticas de cache
  const getCacheStats = useCallback(() => {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [, value] of cache.current.entries()) {
      if ((now - value.timestamp) < cacheTimeout) {
        activeEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      total: cache.current.size,
      active: activeEntries,
      expired: expiredEntries,
      hitRate: cache.current.size > 0 ? (activeEntries / cache.current.size) * 100 : 0
    };
  }, [cacheTimeout]);

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
