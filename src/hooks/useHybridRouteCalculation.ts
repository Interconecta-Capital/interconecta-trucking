
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
      console.log('🚀 Iniciando cálculo híbrido mejorado');
      console.log('📍 Origen:', origin);
      console.log('📍 Destino:', destination);
      console.log('🛤️ Waypoints:', waypoints);

      // Validar coordenadas antes de proceder
      if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
        throw new Error('Coordenadas de origen o destino inválidas');
      }

      // Paso 1: Calcular distancia y tiempo con Mapbox (más preciso)
      console.log('📊 Calculando con Mapbox...');
      const { data: mapboxData, error: mapboxError } = await supabase.functions.invoke('calculate-route', {
        body: {
          origin,
          destination,
          waypoints: waypoints || []
        }
      });

      if (mapboxError) {
        console.error('❌ Error en Mapbox:', mapboxError);
        // No lanzar error, continuar solo con Google Maps
        toast.warning('Cálculo Mapbox falló, usando estimación alternativa');
      }

      let mapboxSuccess = false;
      let finalDistanceKm = 0;
      let finalDurationMinutes = 0;

      if (mapboxData && mapboxData.success) {
        mapboxSuccess = true;
        finalDistanceKm = mapboxData.distance_km;
        finalDurationMinutes = mapboxData.duration_minutes;
        console.log('✅ Mapbox exitoso:', { distance: finalDistanceKm, duration: finalDurationMinutes });
      }

      // Paso 2: Intentar obtener geometría con Google Maps
      console.log('🗺️ Obteniendo visualización con Google Maps...');
      let googleResult = null;
      
      try {
        googleResult = await googleMapsService.calculateRoute(origin, destination, waypoints);
        
        if (googleResult) {
          console.log('✅ Google Maps response received:', {
            success: googleResult.success,
            fallback: googleResult.fallback,
            distance: googleResult.distance_km
          });
        }
      } catch (googleError) {
        console.warn('⚠️ Google Maps service error:', googleError);
      }

      // Si Mapbox falló, usar Google Maps para los cálculos también
      if (!mapboxSuccess && googleResult && googleResult.success) {
        finalDistanceKm = googleResult.distance_km;
        finalDurationMinutes = googleResult.duration_minutes;
        console.log('✅ Usando Google Maps para cálculos:', { distance: finalDistanceKm, duration: finalDurationMinutes });
      }

      // Si ambos fallaron, hacer cálculo estimado
      if (!mapboxSuccess && (!googleResult || !googleResult.success)) {
        console.warn('⚠️ Ambos servicios fallaron, usando estimación directa');
        const directDistance = calculateDirectDistance(origin, destination);
        finalDistanceKm = Math.round(directDistance * 1.3 * 100) / 100; // Factor 1.3 para rutas reales
        finalDurationMinutes = Math.round(finalDistanceKm * 1.2); // Estimación: 1.2 min por km
        
        toast.warning(`Usando estimación directa: ${finalDistanceKm} km`);
      }

      // Combinar resultados
      const hybridResult: HybridRouteResult = {
        distance_km: finalDistanceKm,
        duration_minutes: finalDurationMinutes,
        route_geometry: {
          type: 'LineString',
          coordinates: googleResult?.route_geometry?.coordinates || ''
        },
        google_data: googleResult?.google_data,
        success: true,
        fallback: googleResult?.fallback || false,
        fallback_reason: googleResult?.fallback_reason
      };

      console.log('✅ Cálculo híbrido completado:', hybridResult);
      setRouteData(hybridResult);
      
      if (finalDistanceKm > 0) {
        const fallbackText = hybridResult.fallback ? ' (estimado)' : '';
        toast.success(
          `Ruta calculada: ${finalDistanceKm} km (${Math.round(finalDurationMinutes / 60)}h ${finalDurationMinutes % 60}m)${fallbackText}`
        );
      }

      return hybridResult;
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
