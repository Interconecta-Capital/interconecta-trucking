
import { useState, useCallback } from 'react';
import { peajesINEGIService, type CalculoPeajesINEGI, type Coordenada } from '@/services/peajesINEGI';

interface UsePeajesINEGIReturn {
  calcularPeajes: (
    origen: Coordenada,
    destino: Coordenada,
    configuracion: 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3',
    waypoints?: Coordenada[]
  ) => Promise<CalculoPeajesINEGI['respuesta']>;
  loading: boolean;
  error: string | null;
  limpiarCache: () => void;
  estadisticasCache: { entradas: number; ultimaActualizacion: number | null };
}

export const usePeajesINEGI = (): UsePeajesINEGIReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calcularPeajes = useCallback(async (
    origen: Coordenada,
    destino: Coordenada,
    configuracion: 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3',
    waypoints?: Coordenada[]
  ): Promise<CalculoPeajesINEGI['respuesta']> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Calculando peajes con API INEGI/SAKBE:', {
        origen,
        destino,
        configuracion,
        waypoints: waypoints?.length || 0
      });

      const resultado = await peajesINEGIService.calcularPeajesRuta(
        origen,
        destino,
        configuracion,
        waypoints
      );

      console.log('Resultado cálculo peajes:', {
        casetas: resultado.casetas.length,
        costoTotal: resultado.costoTotal,
        rutaOptimizada: resultado.rutaOptimizada
      });

      return resultado;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al calcular peajes';
      setError(errorMsg);
      console.error('Error en usePeajesINEGI:', err);
      
      // En caso de error, devolver cálculo básico
      const distanciaEstimada = calcularDistanciaBasica(origen, destino);
      const factorVehicular = getFactorVehicular(configuracion);
      
      return {
        casetas: [],
        costoTotal: Math.round(distanciaEstimada * 2.80 * factorVehicular),
        distanciaTotal: distanciaEstimada,
        tiempoEstimado: Math.round(distanciaEstimada / 60),
        rutaOptimizada: false
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const limpiarCache = useCallback(() => {
    peajesINEGIService.limpiarCache();
  }, []);

  const estadisticasCache = peajesINEGIService.getEstadisticasCache();

  return {
    calcularPeajes,
    loading,
    error,
    limpiarCache,
    estadisticasCache
  };
};

// Funciones auxiliares para fallback
function calcularDistanciaBasica(origen: Coordenada, destino: Coordenada): number {
  const R = 6371;
  const dLat = deg2rad(destino.lat - origen.lat);
  const dLon = deg2rad(destino.lng - origen.lng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(origen.lat)) * Math.cos(deg2rad(destino.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

function getFactorVehicular(configuracion: string): number {
  const factores: { [key: string]: number } = {
    'C2': 1.0,
    'C3': 1.5,
    'T2S1': 1.8,
    'T3S2': 2.0,
    'T3S3': 2.2
  };
  return factores[configuracion] || 2.0;
}
