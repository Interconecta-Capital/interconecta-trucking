
import { useState, useCallback, useRef, useEffect } from 'react';

interface CatalogCacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseCatalogsCacheOptions {
  defaultTTL?: number;
  maxCacheSize?: number;
  enablePersistence?: boolean;
}

export const useCatalogosCache = <T = any>(options: UseCatalogsCacheOptions = {}) => {
  const {
    defaultTTL = 30 * 60 * 1000, // 30 minutos
    maxCacheSize = 100,
    enablePersistence = true
  } = options;

  const cache = useRef<Map<string, CatalogCacheEntry<T>>>(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  });

  // Cargar cache desde localStorage al inicializar
  useEffect(() => {
    if (enablePersistence) {
      try {
        const savedCache = localStorage.getItem('catalogos_cache');
        if (savedCache) {
          const parsed = JSON.parse(savedCache);
          const now = Date.now();
          
          // Filtrar entradas expiradas
          Object.entries(parsed).forEach(([key, entry]: [string, any]) => {
            if (entry.expiresAt > now) {
              cache.current.set(key, entry);
            }
          });
          
          updateStats();
        }
      } catch (error) {
        console.warn('Error loading catalog cache from localStorage:', error);
      }
    }
  }, [enablePersistence]);

  // Actualizar estadísticas
  const updateStats = useCallback(() => {
    setCacheStats(prev => ({
      ...prev,
      size: cache.current.size
    }));
  }, []);

  // Persistir cache en localStorage
  const persistCache = useCallback(() => {
    if (enablePersistence) {
      try {
        const cacheObject = Object.fromEntries(cache.current.entries());
        localStorage.setItem('catalogos_cache', JSON.stringify(cacheObject));
      } catch (error) {
        console.warn('Error persisting catalog cache:', error);
      }
    }
  }, [enablePersistence]);

  // Obtener del cache
  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    const now = Date.now();

    if (!entry) {
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    if (entry.expiresAt <= now) {
      cache.current.delete(key);
      updateStats();
      persistCache();
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    return entry.data;
  }, [updateStats, persistCache]);

  // Guardar en cache
  const set = useCallback((key: string, data: T, ttl?: number): void => {
    const now = Date.now();
    const actualTTL = ttl || defaultTTL;

    // Limpiar cache si alcanza el tamaño máximo
    if (cache.current.size >= maxCacheSize) {
      const oldestKey = cache.current.keys().next().value;
      if (oldestKey) {
        cache.current.delete(oldestKey);
      }
    }

    cache.current.set(key, {
      data,
      timestamp: now,
      expiresAt: now + actualTTL
    });

    updateStats();
    persistCache();
  }, [defaultTTL, maxCacheSize, updateStats, persistCache]);

  // Invalidar entrada específica
  const invalidate = useCallback((key: string): boolean => {
    const deleted = cache.current.delete(key);
    if (deleted) {
      updateStats();
      persistCache();
    }
    return deleted;
  }, [updateStats, persistCache]);

  // Limpiar todo el cache
  const clear = useCallback(() => {
    cache.current.clear();
    setCacheStats({ hits: 0, misses: 0, size: 0 });
    if (enablePersistence) {
      localStorage.removeItem('catalogos_cache');
    }
  }, [enablePersistence]);

  // Limpiar entradas expiradas
  const cleanup = useCallback(() => {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of cache.current.entries()) {
      if (entry.expiresAt <= now) {
        cache.current.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      updateStats();
      persistCache();
    }

    return deletedCount;
  }, [updateStats, persistCache]);

  // Obtener estadísticas detalladas
  const getDetailedStats = useCallback(() => {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const [, entry] of cache.current.entries()) {
      if (entry.expiresAt <= now) {
        expiredCount++;
      }
      totalSize += JSON.stringify(entry.data).length;
    }

    return {
      ...cacheStats,
      expired: expiredCount,
      hitRate: cacheStats.hits + cacheStats.misses > 0 
        ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100 
        : 0,
      avgSize: cacheStats.size > 0 ? totalSize / cacheStats.size : 0,
      totalSizeKB: totalSize / 1024
    };
  }, [cacheStats]);

  return {
    get,
    set,
    invalidate,
    clear,
    cleanup,
    stats: cacheStats,
    detailedStats: getDetailedStats()
  };
};
