import { useState, useCallback } from 'react';
import { mapService } from '@/services/mapService';
import { toast } from 'sonner';

export interface Coordenada {
  lat: number;
  lng: number;
}

export interface ParadaAutorizada {
  id: string;
  direccion: string;
  coordenadas?: Coordenada;
  tiempoServicio: number; // minutos para carga/descarga
  orden: number; // secuencia en la ruta
  tipo: 'carga' | 'descarga' | 'inspeccion' | 'combustible';
  obligatoria: boolean;
  nombre?: string;
}

export interface RutaCompleta {
  origen: Coordenada;
  destino: Coordenada;
  paradas: ParadaAutorizada[];
  distanciaTotal: number; // km
  tiempoTotal: number; // minutos
  tiempoServicio: number; // minutos de paradas
  combustibleTotal: number; // pesos
  peajesTotal: number; // pesos
  rutaOptimizada: any; // datos de Google Maps
  precision: number; // porcentaje
}

export const useRutaConParadas = () => {
  const [calculando, setCalculando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodificarDireccion = async (direccion: string): Promise<Coordenada | null> => {
    try {
      const resultado = await mapService.geocodeAddress(direccion);
      if (resultado) {
        return {
          lat: resultado.coordinates.lat,
          lng: resultado.coordinates.lng
        };
      }
      return null;
    } catch (error) {
      console.error('Error geocodificando:', direccion, error);
      return null;
    }
  };

  const calcularRutaCompleta = useCallback(async (
    origenDir: string,
    destinoDir: string,
    paradas: ParadaAutorizada[] = []
  ): Promise<RutaCompleta | null> => {
    setCalculando(true);
    setError(null);

    try {
      // 1. Geocodificar origen y destino
      const [origenCoords, destinoCoords] = await Promise.all([
        geocodificarDireccion(origenDir),
        geocodificarDireccion(destinoDir)
      ]);

      if (!origenCoords || !destinoCoords) {
        throw new Error('No se pudieron geocodificar origen o destino');
      }

      // 2. Geocodificar paradas
      const paradasConCoordenadas = await Promise.all(
        paradas.map(async (parada) => {
          if (parada.coordenadas) {
            return parada;
          }
          
          const coords = await geocodificarDireccion(parada.direccion);
          return {
            ...parada,
            coordenadas: coords || undefined
          };
        })
      );

      // 3. Filtrar paradas que se pudieron geocodificar
      const paradasValidas = paradasConCoordenadas.filter(p => p.coordenadas);

      // 4. Crear lista de waypoints para cálculo de ruta
      const waypoints: Coordenada[] = [origenCoords];
      
      // Agregar paradas ordenadas
      const paradasOrdenadas = paradasValidas.sort((a, b) => a.orden - b.orden);
      waypoints.push(...paradasOrdenadas.map(p => p.coordenadas!));
      
      waypoints.push(destinoCoords);

      // 5. Calcular ruta completa con Google Maps
      let rutaCalculada;
      
      if (waypoints.length === 2) {
        // Ruta simple sin paradas
        rutaCalculada = await mapService.calculateRoute([origenCoords, destinoCoords]);
      } else {
        // Ruta con paradas - usar optimización si hay más de 2 paradas
        if (paradasValidas.length > 2) {
          const rutaOptimizada = await mapService.optimizeRoute(waypoints);
          if (rutaOptimizada) {
            // Recalcular con orden optimizado
            rutaCalculada = await mapService.calculateRoute(rutaOptimizada.optimizedPoints);
          } else {
            // Fallback a ruta no optimizada
            rutaCalculada = await mapService.calculateRoute(waypoints);
          }
        } else {
          rutaCalculada = await mapService.calculateRoute(waypoints);
        }
      }

      if (!rutaCalculada) {
        throw new Error('No se pudo calcular la ruta');
      }

      // 6. Calcular tiempo total incluyendo servicios en paradas
      const tiempoServicio = paradasValidas.reduce((total, parada) => 
        total + parada.tiempoServicio, 0
      );

      // 7. Estimar costos
      const costoCombustible = calcularCostoCombustible(rutaCalculada.distance);
      const costoPeajes = await estimarCostoPeajes(rutaCalculada.distance);

      const rutaCompleta: RutaCompleta = {
        origen: origenCoords,
        destino: destinoCoords,
        paradas: paradasOrdenadas,
        distanciaTotal: rutaCalculada.distance,
        tiempoTotal: rutaCalculada.duration + tiempoServicio,
        tiempoServicio,
        combustibleTotal: costoCombustible,
        peajesTotal: costoPeajes,
        rutaOptimizada: rutaCalculada,
        precision: paradasValidas.length === paradas.length ? 95 : 80
      };

      console.log('✅ Ruta calculada exitosamente:', {
        distancia: rutaCompleta.distanciaTotal,
        tiempo: rutaCompleta.tiempoTotal,
        paradas: rutaCompleta.paradas.length,
        precision: rutaCompleta.precision
      });

      return rutaCompleta;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error calculando ruta completa';
      setError(errorMsg);
      console.error('❌ Error en cálculo de ruta completa:', error);
      toast.error(errorMsg);
      return null;
    } finally {
      setCalculando(false);
    }
  }, []);

  const optimizarOrdenParadas = useCallback(async (
    origen: Coordenada,
    destino: Coordenada,
    paradas: ParadaAutorizada[]
  ): Promise<ParadaAutorizada[]> => {
    if (paradas.length <= 1) return paradas;

    try {
      const puntos = [origen, ...paradas.map(p => p.coordenadas!), destino];
      const rutaOptimizada = await mapService.optimizeRoute(puntos);
      
      if (rutaOptimizada) {
        // Reordenar paradas según la optimización (excluyendo origen y destino)
        const nuevoOrden = rutaOptimizada.optimizedPoints.slice(1, -1);
        const paradasReordenadas = nuevoOrden.map((coord, index) => {
          const parada = paradas.find(p => 
            p.coordenadas && 
            Math.abs(p.coordenadas.lat - coord.lat) < 0.001 &&
            Math.abs(p.coordenadas.lng - coord.lng) < 0.001
          );
          return parada ? { ...parada, orden: index + 1 } : paradas[index];
        });
        
        return paradasReordenadas;
      }
      
      return paradas;
    } catch (error) {
      console.error('Error optimizando orden de paradas:', error);
      return paradas;
    }
  }, []);

  const calcularDistanciaConParadas = useCallback(async (
    puntos: Coordenada[]
  ): Promise<{ distancia: number; tiempo: number } | null> => {
    try {
      const resultado = await mapService.calculateRoute(puntos);
      return resultado ? {
        distancia: resultado.distance,
        tiempo: resultado.duration
      } : null;
    } catch (error) {
      console.error('Error calculando distancia con paradas:', error);
      return null;
    }
  }, []);

  // Funciones auxiliares para cálculos de costos
  const calcularCostoCombustible = (distanciaKm: number): number => {
    const rendimiento = 8; // km por litro (estimado para camión)
    const precioDiesel = 24.50; // pesos por litro (estimado)
    const litrosNecesarios = distanciaKm / rendimiento;
    return Math.round(litrosNecesarios * precioDiesel);
  };

  const estimarCostoPeajes = async (distanciaKm: number): Promise<number> => {
    // Estimación básica: $1.50 pesos por km en autopistas
    // En una implementación real, esto se calcularía basado en la ruta específica
    const factorPeaje = 0.85; // Asumiendo 85% de la ruta usa autopistas
    return Math.round(distanciaKm * factorPeaje * 1.50);
  };

  return {
    calcularRutaCompleta,
    optimizarOrdenParadas,
    calcularDistanciaConParadas,
    calculando,
    error,
    clearError: () => setError(null)
  };
};