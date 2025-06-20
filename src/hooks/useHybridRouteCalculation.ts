
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
  fallback?: boolean;
  fallback_reason?: string;
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
      console.log('🚀 Iniciando cálculo híbrido mejorado con nueva API');
      console.log('📍 Origen:', origin);
      console.log('📍 Destino:', destination);
      console.log('🛤️ Waypoints:', waypoints);

      // Validar coordenadas antes de proceder
      if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
        throw new Error('Coordenadas de origen o destino inválidas');
      }

      // Paso 1: Intentar Google Maps primero (más preciso para visualización)
      console.log('🗺️ Calculando con Google Maps API...');
      let googleResult = null;
      
      try {
        googleResult = await googleMapsService.calculateRoute(origin, destination, waypoints);
        
        if (googleResult && googleResult.success) {
          console.log('✅ Google Maps calculation successful:', {
            distance: googleResult.distance_km,
            duration: googleResult.duration_minutes,
            fallback: googleResult.fallback
          });
          
          setRouteData(googleResult);
          
          if (!googleResult.fallback) {
            toast.success(
              `Ruta calculada: ${googleResult.distance_km} km (${Math.round(googleResult.duration_minutes / 60)}h ${googleResult.duration_minutes % 60}m)`
            );
          } else {
            toast.warning(
              `Ruta estimada: ${googleResult.distance_km} km (${googleResult.fallback_reason})`
            );
          }

          return googleResult;
        }
      } catch (googleError) {
        console.warn('⚠️ Google Maps service error:', googleError);
      }

      // Paso 2: Si Google Maps falla, usar Mapbox como fallback
      console.log('📊 Google Maps falló, intentando con Mapbox...');
      const { data: mapboxData, error: mapboxError } = await supabase.functions.invoke('calculate-route', {
        body: {
          origin,
          destination,
          waypoints: waypoints || []
        }
      });

      if (mapboxError) {
        console.error('❌ Error en Mapbox:', mapboxError);
        throw new Error('Ambos servicios de mapas fallaron');
      }

      if (mapboxData && mapboxData.success) {
        console.log('✅ Mapbox calculation successful:', {
          distance: mapboxData.distance_km,
          duration: mapboxData.duration_minutes
        });

        const mapboxResult: HybridRouteResult = {
          distance_km: mapboxData.distance_km,
          duration_minutes: mapboxData.duration_minutes,
          route_geometry: {
            type: 'LineString',
            coordinates: '' // Mapbox no proporciona polyline compatible con Google
          },
          success: true,
          fallback: true,
          fallback_reason: 'Google Maps no disponible, usando Mapbox'
        };

        setRouteData(mapboxResult);
        
        toast.success(
          `Ruta calculada con Mapbox: ${mapboxResult.distance_km} km (${Math.round(mapboxResult.duration_minutes / 60)}h ${mapboxResult.duration_minutes % 60}m)`
        );

        return mapboxResult;
      }

      // Paso 3: Si ambos fallan, cálculo directo estimado
      console.warn('⚠️ Ambos servicios fallaron, usando estimación directa');
      const directDistance = calculateDirectDistance(origin, destination);
      const estimatedDistance = Math.round(directDistance * 1.3 * 100) / 100; // Factor 1.3 para rutas reales
      const estimatedDuration = Math.round(estimatedDistance * 1.2); // Estimación: 1.2 min por km

      const fallbackResult: HybridRouteResult = {
        distance_km: estimatedDistance,
        duration_minutes: estimatedDuration,
        route_geometry: {
          type: 'LineString',
          coordinates: ''
        },
        success: true,
        fallback: true,
        fallback_reason: 'Servicios de mapas no disponibles, usando estimación directa'
      };

      setRouteData(fallbackResult);
      
      toast.warning(
        `Ruta estimada: ${estimatedDistance} km (sin servicios de mapas disponibles)`
      );

      return fallbackResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido en cálculo';
      console.error('❌ Error en cálculo híbrido:', err);
      setError(errorMessage);
      
      toast.error(`Error al calcular ruta: ${errorMessage}`);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  // Función auxiliar para calcular distancia directa
  const calculateDirectDistance = (origin: RoutePoint, destination: RoutePoint): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLon = (destination.lng - origin.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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
