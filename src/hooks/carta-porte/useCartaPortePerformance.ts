
import { useMemo, useCallback, useRef } from 'react';
import { debounce, throttle } from 'lodash';
import { CartaPorteFormData } from './useCartaPorteMappers';

interface PerformanceConfig {
  debounceDelay: number;
  throttleDelay: number;
  memoizationTTL: number;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  debounceDelay: 300,
  throttleDelay: 100,
  memoizationTTL: 5000
};

export const useCartaPortePerformance = (config: Partial<PerformanceConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const memoCache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  // Función para generar hash de los datos del formulario
  const generateFormHash = useCallback((formData: CartaPorteFormData): string => {
    return JSON.stringify(formData).slice(0, 100); // Hash simple basado en JSON
  }, []);

  // Memoización inteligente con TTL - removido generic problemático
  const memoizeWithTTL = useCallback((key: string, computeFn: () => any): any => {
    const cached = memoCache.current.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < finalConfig.memoizationTTL) {
      return cached.data;
    }
    
    const result = computeFn();
    memoCache.current.set(key, { data: result, timestamp: now });
    
    // Limpiar entradas expiradas
    for (const [k, v] of memoCache.current.entries()) {
      if ((now - v.timestamp) >= finalConfig.memoizationTTL) {
        memoCache.current.delete(k);
      }
    }
    
    return result;
  }, [finalConfig.memoizationTTL]);

  // Debounced save para auto-save
  const createDebouncedSave = useCallback((saveFn: (data: CartaPorteFormData) => Promise<void>) => {
    return debounce(saveFn, finalConfig.debounceDelay);
  }, [finalConfig.debounceDelay]);

  // Throttled validation para validación en tiempo real
  const createThrottledValidation = useCallback((validateFn: (data: CartaPorteFormData) => any) => {
    return throttle(validateFn, finalConfig.throttleDelay);
  }, [finalConfig.throttleDelay]);

  // Optimización de re-renders con shallow comparison - removido generic problemático
  const shallowMemo = useCallback((obj: object, deps: any[]): any => {
    return useMemo(() => obj, deps);
  }, []);

  // Función para optimizar listas grandes - simplificado sin generics
  const optimizeListRendering = useCallback((
    items: any[],
    getKey: (item: any) => string,
    batchSize: number = 20
  ) => {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return { batches, totalItems: items.length };
  }, []);

  // Función para lazy loading de componentes pesados - simplificado sin generics
  const createLazyLoader = useCallback((
    loadFn: () => Promise<any>,
    fallback?: React.ComponentType
  ) => {
    return {
      load: loadFn,
      fallback: fallback || (() => <div className="animate-pulse">Cargando...</div>)
    };
  }, []);

  // Optimización de formularios grandes
  const optimizeFormSections = useCallback((formData: CartaPorteFormData) => {
    const hash = generateFormHash(formData);
    
    return memoizeWithTTL(`form_sections_${hash}`, () => {
      return {
        configuracion: { ...formData.configuracion },
        ubicaciones: [...formData.ubicaciones],
        mercancias: [...formData.mercancias],
        autotransporte: { ...formData.autotransporte },
        figuras: [...formData.figuras]
      };
    });
  }, [generateFormHash, memoizeWithTTL]);

  // Limpieza de memoria
  const cleanup = useCallback(() => {
    memoCache.current.clear();
  }, []);

  return {
    generateFormHash,
    memoizeWithTTL,
    createDebouncedSave,
    createThrottledValidation,
    shallowMemo,
    optimizeListRendering,
    createLazyLoader,
    optimizeFormSections,
    cleanup
  };
};
