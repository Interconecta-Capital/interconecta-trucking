import { useState, useCallback, useEffect } from 'react';
import { CartaPorteFormData } from './useCartaPorteMappers';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 50
};

export const useCartaPorteCache = (config: Partial<CacheConfig> = {}) => {
  const [cache, setCache] = useState<Map<string, CacheEntry<any>>>(new Map());
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Limpiar cache expirado
  const cleanExpiredEntries = useCallback(() => {
    const now = Date.now();
    setCache(prev => {
      const newCache = new Map(prev);
      for (const [key, entry] of newCache.entries()) {
        if (entry.expiresAt < now) {
          newCache.delete(key);
        }
      }
      return newCache;
    });
  }, []);

  // Limpiar cache automáticamente cada minuto
  useEffect(() => {
    const interval = setInterval(cleanExpiredEntries, 60000);
    return () => clearInterval(interval);
  }, [cleanExpiredEntries]);

  const get = useCallback(<T>(key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (entry.expiresAt < Date.now()) {
      cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }, [cache]);

  const set = useCallback(<T>(key: string, data: T) => {
    const now = Date.now();
    setCache(prev => {
      const newCache = new Map(prev);
      
      // Eliminar entradas más antiguas si se alcanza el límite
      if (newCache.size >= finalConfig.maxSize) {
        const oldestKey = newCache.keys().next().value;
        newCache.delete(oldestKey);
      }
      
      newCache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + finalConfig.ttl
      });
      
      return newCache;
    });
  }, [finalConfig.ttl, finalConfig.maxSize]);

  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cache.get(key);
    if (!entry) return false;
    
    if (entry.expiresAt < Date.now()) {
      cache.delete(key);
      return false;
    }
    
    return true;
  }, [cache]);

  // Cache específico para formularios
  const cacheFormData = useCallback((cartaPorteId: string, formData: CartaPorteFormData) => {
    set(`form_${cartaPorteId}`, formData);
  }, [set]);

  const getCachedFormData = useCallback((cartaPorteId: string): CartaPorteFormData | null => {
    return get<CartaPorteFormData>(`form_${cartaPorteId}`);
  }, [get]);

  // Cache para validaciones
  const cacheValidation = useCallback((formHash: string, validation: any) => {
    set(`validation_${formHash}`, validation);
  }, [set]);

  const getCachedValidation = useCallback((formHash: string) => {
    return get(`validation_${formHash}`);
  }, [get]);

  return {
    get,
    set,
    remove,
    clear,
    has,
    cacheFormData,
    getCachedFormData,
    cacheValidation,
    getCachedValidation,
    size: cache.size,
    cleanExpiredEntries
  };
};
