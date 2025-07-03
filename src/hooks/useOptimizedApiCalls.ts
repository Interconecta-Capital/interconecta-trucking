
import { useCallback } from 'react';
import { useCacheInteligente } from './useCacheInteligente';
import { supabase } from '@/integrations/supabase/client';

interface UseOptimizedApiCallsReturn {
  getCombustiblePrices: (estado: string) => Promise<any>;
  getPeajesRuta: (origen: string, destino: string) => Promise<any>;
  getRestriccionesUrbanas: (ciudad: string) => Promise<any>;
  getConfiguracionEmpresa: () => Promise<any>;
  getCostosVehiculoRuta: (vehiculoId: string, rutaHash: string) => Promise<any>;
  getAnalisisHistorico: (periodo: string) => Promise<any>;
  invalidatePrices: () => Promise<void>;
  invalidateVehicleData: (vehiculoId?: string) => Promise<void>;
}

export const useOptimizedApiCalls = (): UseOptimizedApiCallsReturn => {
  const cache = useCacheInteligente();

  const getCombustiblePrices = useCallback(async (estado: string) => {
    return cache.get(
      `precios_combustible_${estado}`,
      async () => {
        console.log('🛢️ Fetching fresh combustible prices for:', estado);
        
        // Simulate API call to CRE (Comisión Reguladora de Energía)
        const response = await fetch(`https://api.cre.gob.mx/precios/${estado}`).catch(() => null);
        
        if (!response?.ok) {
          // Fallback to mock data
          return {
            regular: 22.50 + Math.random() * 2,
            premium: 24.80 + Math.random() * 2,
            diesel: 23.20 + Math.random() * 2,
            timestamp: new Date().toISOString(),
            estado
          };
        }
        
        return response.json();
      },
      {
        tipo: 'memoria',
        ttl: 6 * 60 * 60 * 1000, // 6 hours
        invalidacion: 'tiempo',
        tags: ['combustible', 'precios', 'apis_externas'],
        priority: 'high'
      }
    );
  }, [cache]);

  const getPeajesRuta = useCallback(async (origen: string, destino: string) => {
    const rutaKey = `${origen.toLowerCase()}_${destino.toLowerCase()}`;
    
    return cache.get(
      `peajes_${rutaKey}`,
      async () => {
        console.log('🛣️ Calculating fresh peajes for route:', origen, '->', destino);
        
        // Simulate INEGI/SAKBE API integration
        const mockPeajes = [
          { caseta: 'Caseta México-Querétaro', costo: 245, km: 45 },
          { caseta: 'Caseta Querétaro-Guadalajara', costo: 380, km: 75 },
          { caseta: 'Caseta Guadalajara-Tepic', costo: 180, km: 35 }
        ];
        
        const totalCosto = mockPeajes.reduce((sum, peaje) => sum + peaje.costo, 0);
        const totalKm = mockPeajes.reduce((sum, peaje) => sum + peaje.km, 0);
        
        return {
          origen,
          destino,
          peajes: mockPeajes,
          costoTotal: totalCosto,
          distanciaTotal: totalKm,
          calculadoEn: new Date().toISOString()
        };
      },
      {
        tipo: 'memoria',
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        invalidacion: 'tiempo',
        tags: ['peajes', 'rutas', 'apis_externas'],
        priority: 'high'
      }
    );
  }, [cache]);

  const getRestriccionesUrbanas = useCallback(async (ciudad: string) => {
    return cache.get(
      `restricciones_${ciudad.toLowerCase()}`,
      async () => {
        console.log('🚫 Fetching urban restrictions for:', ciudad);
        
        // Query from Supabase or external API
        const { data, error } = await supabase
          .from('restricciones_urbanas')
          .select('*')
          .eq('ciudad', ciudad)
          .eq('activa', true);

        if (error) {
          console.warn('Error fetching restrictions:', error);
          return [];
        }

        return data || [];
      },
      {
        tipo: 'memoria',
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
        invalidacion: 'tiempo',
        tags: ['restricciones', 'urbanas', 'regulaciones'],
        priority: 'medium'
      }
    );
  }, [cache]);

  const getConfiguracionEmpresa = useCallback(async () => {
    return cache.get(
      'configuracion_empresa',
      async () => {
        console.log('⚙️ Fetching company configuration...');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        return {
          ...data,
          configuracionOperativa: {
            tiposVehiculos: ['C2', 'C3', 'T3S2', 'T3S3'],
            rutasFrecuentes: ['mexico_guadalajara', 'guadalajara_monterrey'],
            preciosBase: { C2: 15, C3: 25, T3S2: 35, T3S3: 45 }
          }
        };
      },
      {
        tipo: 'memoria',
        ttl: 24 * 60 * 60 * 1000, // Until manual invalidation
        invalidacion: 'manual',
        tags: ['configuracion', 'empresa', 'persistent'],
        priority: 'high'
      }
    );
  }, [cache]);

  const getCostosVehiculoRuta = useCallback(async (vehiculoId: string, rutaHash: string) => {
    return cache.get(
      `costos_${vehiculoId}_${rutaHash}`,
      async () => {
        console.log('💰 Calculating vehicle-route costs:', vehiculoId, rutaHash);
        
        // Get vehicle data
        const vehiculo = await cache.get(`vehiculo_${vehiculoId}`, async () => {
          const { data, error } = await supabase
            .from('vehiculos')
            .select('*')
            .eq('id', vehiculoId)
            .single();

          if (error) throw error;
          return data;
        });

        // Get combustible prices
        const precios = await getCombustiblePrices('nacional');
        
        // Calculate costs
        const distanciaEstimada = 450; // This would come from route calculation
        const rendimiento = vehiculo?.rendimiento_combustible || 3.0;
        const combustibleNecesario = distanciaEstimada / rendimiento;
        const costoCombustible = combustibleNecesario * precios.diesel;
        
        return {
          vehiculoId,
          rutaHash,
          distancia: distanciaEstimada,
          combustible: {
            litros: Math.round(combustibleNecesario * 100) / 100,
            costo: Math.round(costoCombustible * 100) / 100
          },
          peajes: 800, // Would get from getPeajesRuta
          costoTotal: Math.round((costoCombustible + 800) * 100) / 100,
          calculadoEn: new Date().toISOString()
        };
      },
      {
        tipo: 'memoria',
        ttl: 30 * 60 * 1000, // 30 minutes
        invalidacion: 'tiempo',
        tags: ['costos', 'vehiculos', 'rutas'],
        priority: 'medium'
      }
    );
  }, [cache, getCombustiblePrices]);

  const getAnalisisHistorico = useCallback(async (periodo: string) => {
    return cache.get(
      `analisis_historico_${periodo}`,
      async () => {
        console.log('📊 Generating historical analysis for:', periodo);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('analisis_viajes')
          .select('*')
          .eq('user_id', user.id)
          .gte('fecha_viaje', getDateFromPeriod(periodo))
          .order('fecha_viaje', { ascending: false });

        if (error) throw error;

        // Process and aggregate data
        const analisis = {
          totalViajes: data?.length || 0,
          costoPromedio: data?.reduce((sum, v) => sum + (v.costo_real || 0), 0) / (data?.length || 1),
          margenPromedio: data?.reduce((sum, v) => sum + (v.margen_real || 0), 0) / (data?.length || 1),
          rutasMasFrecuentes: getRutasFrecuentes(data || []),
          tendencias: calcularTendencias(data || []),
          generadoEn: new Date().toISOString()
        };

        return analisis;
      },
      {
        tipo: 'memoria',
        ttl: 2 * 60 * 60 * 1000, // 2 hours
        invalidacion: 'tiempo',
        tags: ['analisis', 'historico', 'reportes'],
        priority: 'low'
      }
    );
  }, [cache]);

  // Invalidation methods
  const invalidatePrices = useCallback(async () => {
    await cache.invalidateByTag('precios');
    await cache.invalidateByTag('combustible');
  }, [cache]);

  const invalidateVehicleData = useCallback(async (vehiculoId?: string) => {
    if (vehiculoId) {
      await cache.invalidateByPattern(`vehiculo_${vehiculoId}*`);
      await cache.invalidateByPattern(`costos_${vehiculoId}*`);
    } else {
      await cache.invalidateByTag('vehiculos');
    }
  }, [cache]);

  return {
    getCombustiblePrices,
    getPeajesRuta,
    getRestriccionesUrbanas,
    getConfiguracionEmpresa,
    getCostosVehiculoRuta,
    getAnalisisHistorico,
    invalidatePrices,
    invalidateVehicleData
  };
};

// Helper functions
function getDateFromPeriod(periodo: string): string {
  const now = new Date();
  switch (periodo) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }
}

function getRutasFrecuentes(viajes: any[]): Array<{ ruta: string; count: number }> {
  const rutaCount = viajes.reduce((acc, viaje) => {
    if (viaje.ruta_hash) {
      acc[viaje.ruta_hash] = (acc[viaje.ruta_hash] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(rutaCount)
    .map(([ruta, count]) => ({ ruta, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function calcularTendencias(viajes: any[]): { costo: string; margen: string } {
  if (viajes.length < 2) return { costo: 'estable', margen: 'estable' };

  const recientes = viajes.slice(0, Math.floor(viajes.length / 2));
  const anteriores = viajes.slice(Math.floor(viajes.length / 2));

  const costoReciente = recientes.reduce((sum, v) => sum + (v.costo_real || 0), 0) / recientes.length;
  const costoAnterior = anteriores.reduce((sum, v) => sum + (v.costo_real || 0), 0) / anteriores.length;

  const margenReciente = recientes.reduce((sum, v) => sum + (v.margen_real || 0), 0) / recientes.length;
  const margenAnterior = anteriores.reduce((sum, v) => sum + (v.margen_real || 0), 0) / anteriores.length;

  return {
    costo: costoReciente > costoAnterior * 1.05 ? 'subida' : costoReciente < costoAnterior * 0.95 ? 'bajada' : 'estable',
    margen: margenReciente > margenAnterior * 1.05 ? 'subida' : margenReciente < margenAnterior * 0.95 ? 'bajada' : 'estable'
  };
}
