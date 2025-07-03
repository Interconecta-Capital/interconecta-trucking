
import { useState, useCallback, useEffect } from 'react';
import { smartCacheManager, type CacheOptions, type CacheMetrics } from '@/services/cache/SmartCacheManager';

interface ConfiguracionCache extends CacheOptions {
  tipo: 'memoria' | 'localStorage' | 'supabase';
  maxSize?: number;
  invalidacion: 'tiempo' | 'evento' | 'manual';
  compresion?: boolean;
}

interface UseCacheInteligenteReturn {
  get: <T>(key: string, fetcher?: () => Promise<T>, config?: ConfiguracionCache) => Promise<T | null>;
  set: <T>(key: string, value: T, config?: ConfiguracionCache) => Promise<void>;
  invalidate: (key: string) => Promise<void>;
  invalidateByPattern: (pattern: string) => Promise<void>;
  invalidateByTag: (tag: string) => Promise<void>;
  clear: () => void;
  getMetrics: () => CacheMetrics;
  preloadFrequentRoutes: () => Promise<void>;
  preloadActiveVehicles: () => Promise<void>;
  anticipatePriceQueries: (rutas: string[]) => Promise<void>;
}

export const useCacheInteligente = (): UseCacheInteligenteReturn => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize predictive cache relations
    initializePredictiveRelations();
    setIsInitialized(true);
  }, []);

  const initializePredictiveRelations = useCallback(() => {
    // Set up common predictive relationships
    smartCacheManager.addPredictiveRelation('precios_combustible', [
      'costos_ruta_frecuente_1',
      'costos_ruta_frecuente_2'
    ]);

    smartCacheManager.addPredictiveRelation('vehiculo_activo', [
      'configuracion_empresa',
      'documentos_vehiculo'
    ]);
  }, []);

  const get = useCallback(async <T>(
    key: string, 
    fetcher?: () => Promise<T>, 
    config?: ConfiguracionCache
  ): Promise<T | null> => {
    const cacheOptions: CacheOptions = {
      ttl: getTTLByType(key, config?.ttl),
      tags: config?.tags || getTagsByKey(key),
      priority: config?.priority || getPriorityByKey(key),
      predictive: config?.tipo !== 'localStorage' // Don't use predictive for localStorage
    };

    console.log(`📦 Cache GET: ${key}`, { config: cacheOptions });

    try {
      const result = await smartCacheManager.get(key, fetcher, cacheOptions);
      
      if (result !== null) {
        console.log(`✅ Cache HIT: ${key}`);
      } else {
        console.log(`❌ Cache MISS: ${key}`);
      }
      
      return result;
    } catch (error) {
      console.error(`💥 Cache ERROR: ${key}`, error);
      throw error;
    }
  }, []);

  const set = useCallback(async <T>(
    key: string, 
    value: T, 
    config?: ConfiguracionCache
  ): Promise<void> => {
    const cacheOptions: CacheOptions = {
      ttl: getTTLByType(key, config?.ttl),
      tags: config?.tags || getTagsByKey(key),
      priority: config?.priority || getPriorityByKey(key)
    };

    console.log(`💾 Cache SET: ${key}`, { config: cacheOptions });
    await smartCacheManager.set(key, value, cacheOptions);
  }, []);

  const invalidate = useCallback(async (key: string): Promise<void> => {
    console.log(`🗑️ Cache INVALIDATE: ${key}`);
    await smartCacheManager.invalidate(key);
  }, []);

  const invalidateByPattern = useCallback(async (pattern: string): Promise<void> => {
    console.log(`🗑️ Cache INVALIDATE PATTERN: ${pattern}`);
    
    // Simple pattern matching for now
    const keys = Array.from((smartCacheManager as any).memoryCache.keys());
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    for (const key of keys) {
      if (regex.test(key)) {
        await smartCacheManager.invalidate(key);
      }
    }
  }, []);

  const invalidateByTag = useCallback(async (tag: string): Promise<void> => {
    console.log(`🗑️ Cache INVALIDATE TAG: ${tag}`);
    await smartCacheManager.invalidateByTag(tag);
  }, []);

  const clear = useCallback(() => {
    console.log('🧹 Cache CLEAR ALL');
    smartCacheManager.clear();
  }, []);

  const getMetrics = useCallback(() => {
    return smartCacheManager.getMetrics();
  }, []);

  // Predictive caching methods
  const preloadFrequentRoutes = useCallback(async (): Promise<void> => {
    console.log('🚀 Preloading frequent routes...');
    
    // This would analyze historical data to identify frequent routes
    const frequentRoutes = [
      'mexico_guadalajara',
      'guadalajara_monterrey',
      'monterrey_cdmx'
    ];

    for (const route of frequentRoutes) {
      try {
        await get(`costos_ruta_${route}`, async () => {
          // Simulate route cost calculation
          return {
            distancia: Math.random() * 1000 + 200,
            combustible: Math.random() * 5000 + 2000,
            peajes: Math.random() * 2000 + 500,
            tiempo: Math.random() * 10 + 5
          };
        }, {
          tipo: 'memoria',
          ttl: 30 * 60 * 1000, // 30 minutes
          invalidacion: 'tiempo',
          tags: ['costos', 'rutas_frecuentes'],
          priority: 'high'
        });
      } catch (error) {
        console.warn(`Failed to preload route ${route}:`, error);
      }
    }
  }, [get]);

  const preloadActiveVehicles = useCallback(async (): Promise<void> => {
    console.log('🚛 Preloading active vehicles data...');
    
    // This would fetch active vehicles from the database
    const activeVehicleIds = ['veh_001', 'veh_002', 'veh_003'];

    for (const vehicleId of activeVehicleIds) {
      try {
        await get(`vehiculo_${vehicleId}`, async () => {
          // Simulate vehicle data fetch
          return {
            id: vehicleId,
            tipo: 'C3',
            capacidad: 15000,
            rendimiento: 3.2,
            documentos: 'vigentes'
          };
        }, {
          tipo: 'memoria',
          ttl: 60 * 60 * 1000, // 1 hour
          invalidacion: 'evento',
          tags: ['vehiculos', 'activos'],
          priority: 'medium'
        });
      } catch (error) {
        console.warn(`Failed to preload vehicle ${vehicleId}:`, error);
      }
    }
  }, [get]);

  const anticipatePriceQueries = useCallback(async (rutas: string[]): Promise<void> => {
    console.log('💰 Anticipating price queries for routes:', rutas);
    
    for (const ruta of rutas) {
      try {
        await get(`precios_${ruta}`, async () => {
          // Simulate price analysis
          return {
            promedio: Math.random() * 10000 + 5000,
            minimo: Math.random() * 5000 + 3000,
            maximo: Math.random() * 15000 + 8000,
            tendencia: ['subida', 'bajada', 'estable'][Math.floor(Math.random() * 3)]
          };
        }, {
          tipo: 'memoria',
          ttl: 2 * 60 * 60 * 1000, // 2 hours
          invalidacion: 'tiempo',
          tags: ['precios', 'predicciones'],
          priority: 'medium'
        });
      } catch (error) {
        console.warn(`Failed to anticipate prices for ${ruta}:`, error);
      }
    }
  }, [get]);

  return {
    get,
    set,
    invalidate,
    invalidateByPattern,
    invalidateByTag,
    clear,
    getMetrics,
    preloadFrequentRoutes,
    preloadActiveVehicles,
    anticipatePriceQueries
  };
};

// Helper functions for cache configuration
function getTTLByType(key: string, customTTL?: number): number {
  if (customTTL) return customTTL;

  // Strategic TTL based on data type
  if (key.includes('precios_combustible')) return 6 * 60 * 60 * 1000; // 6 hours
  if (key.includes('peajes_')) return 24 * 60 * 60 * 1000; // 24 hours
  if (key.includes('restricciones_')) return 7 * 24 * 60 * 60 * 1000; // 7 days
  if (key.includes('patrones_ia')) return 60 * 60 * 1000; // 1 hour
  if (key.includes('costos_')) return 30 * 60 * 1000; // 30 minutes
  if (key.includes('configuracion_')) return 24 * 60 * 60 * 1000; // 24 hours (until change)
  if (key.includes('vehiculo_')) return 60 * 60 * 1000; // 1 hour (until update)
  if (key.includes('analisis_')) return 2 * 60 * 60 * 1000; // 2 hours

  return 60 * 60 * 1000; // 1 hour default
}

function getTagsByKey(key: string): string[] {
  const tags: string[] = [];
  
  if (key.includes('precios_')) tags.push('precios');
  if (key.includes('vehiculo_')) tags.push('vehiculos');
  if (key.includes('ruta_')) tags.push('rutas');
  if (key.includes('combustible')) tags.push('combustible');
  if (key.includes('peajes_')) tags.push('peajes');
  if (key.includes('restricciones_')) tags.push('restricciones');
  if (key.includes('configuracion_')) tags.push('configuracion');
  if (key.includes('analisis_')) tags.push('analisis');
  
  return tags;
}

function getPriorityByKey(key: string): 'low' | 'medium' | 'high' {
  if (key.includes('configuracion_') || key.includes('vehiculo_')) return 'high';
  if (key.includes('precios_') || key.includes('costos_')) return 'medium';
  return 'low';
}
