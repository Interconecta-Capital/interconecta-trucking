
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { googleMapsService } from '@/services/googleMapsService';
import { toast } from 'sonner';

interface RoutePoint {
  lat: number;
  lng: number;
}

interface HybridRouteResult {
  distance_km: number;
  duration_minutes: number;
  route_geometry: {
    type: string;
    coordinates: string; // Google's encoded polyline for visual display
  };
  google_data?: {
    polyline: string;
    bounds: any;
    legs: any[];
  };
  success: boolean;
}

export function useHybridRouteCalculation() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeData, setRouteData] = useState<HybridRouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = async (
    origin: RoutePoint,
    destination: RoutePoint,
    waypoints?: RoutePoint[]
  ): Promise<HybridRouteResult | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      console.log('🚀 Iniciando cálculo híbrido: Mapbox (distancia/tiempo) + Google Maps (ruta visual)');
      console.log('📍 Origen:', origin);
      console.log('📍 Destino:', destination);
      console.log('🛤️ Waypoints:', waypoints);

      // Paso 1: Calcular distancia y tiempo con Mapbox (más preciso para cálculos)
      console.log('📊 Calculando distancia y tiempo con Mapbox...');
      const { data: mapboxData, error: mapboxError } = await supabase.functions.invoke('calculate-route', {
        body: {
          origin,
          destination,
          waypoints
        }
      });

      if (mapboxError) {
        console.error('❌ Error en Mapbox calculation:', mapboxError);
        throw new Error(`Error calculando con Mapbox: ${mapboxError.message}`);
      }

      if (!mapboxData || !mapboxData.success) {
        console.error('❌ Respuesta inválida de Mapbox:', mapboxData);
        throw new Error('No se pudo calcular la ruta con Mapbox');
      }

      console.log('✅ Mapbox - Distancia y tiempo calculados:', {
        distance: mapboxData.distance_km,
        duration: mapboxData.duration_minutes
      });

      // Paso 2: Obtener la geometría visual de la ruta con Google Maps
      console.log('🗺️ Obteniendo geometría de ruta con Google Maps...');
      const googleResult = await googleMapsService.calculateRoute(origin, destination, waypoints);

      if (!googleResult || !googleResult.success) {
        console.warn('⚠️ Google Maps no disponible, usando solo datos de Mapbox');
        // Si Google Maps falla, usar solo los datos de Mapbox
        const result: HybridRouteResult = {
          distance_km: mapboxData.distance_km,
          duration_minutes: mapboxData.duration_minutes,
          route_geometry: mapboxData.route_geometry,
          success: true
        };

        setRouteData(result);
        toast.success(
          `Ruta calculada con Mapbox: ${result.distance_km} km (${Math.round(result.duration_minutes / 60)}h ${result.duration_minutes % 60}m)`
        );
        return result;
      }

      // Paso 3: Combinar los mejores datos de ambos servicios
      const hybridResult: HybridRouteResult = {
        distance_km: mapboxData.distance_km, // Mapbox para precisión
        duration_minutes: mapboxData.duration_minutes, // Mapbox para precisión
        route_geometry: {
          type: 'LineString',
          coordinates: googleResult.route_geometry?.coordinates || mapboxData.route_geometry?.coordinates
        },
        google_data: googleResult.google_data, // Google Maps para visualización
        success: true
      };

      console.log('✅ Cálculo híbrido completado exitosamente:', hybridResult);
      setRouteData(hybridResult);
      
      toast.success(
        `Ruta calculada (Mapbox + Google Maps): ${hybridResult.distance_km} km (${Math.round(hybridResult.duration_minutes / 60)}h ${hybridResult.duration_minutes % 60}m)`
      );

      return hybridResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error en cálculo híbrido:', err);
      setError(errorMessage);
      
      toast.error(`Error al calcular ruta: ${errorMessage}`);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  const clearRoute = () => {
    setRouteData(null);
    setError(null);
  };

  return {
    calculateRoute,
    clearRoute,
    isCalculating,
    routeData,
    error
  };
}
