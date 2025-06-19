
import { useState } from 'react';
import { googleMapsService } from '@/services/googleMapsService';
import { toast } from 'sonner';

interface RoutePoint {
  lat: number;
  lng: number;
}

interface GoogleRouteResult {
  distance_km: number;
  duration_minutes: number;
  route_geometry: {
    type: string;
    coordinates: string;
  };
  google_data?: {
    polyline: string;
    bounds: any;
    legs: any[];
  };
  success: boolean;
}

export function useGoogleRouteCalculation() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeData, setRouteData] = useState<GoogleRouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = async (
    origin: RoutePoint,
    destination: RoutePoint,
    waypoints?: RoutePoint[]
  ): Promise<GoogleRouteResult | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      console.log('🚀 Iniciando cálculo de ruta con Google Maps');
      console.log('📍 Origen:', origin);
      console.log('📍 Destino:', destination);
      console.log('🛤️ Waypoints:', waypoints);
      
      const result = await googleMapsService.calculateRoute(origin, destination, waypoints);

      if (!result || !result.success) {
        throw new Error('No se pudo calcular la ruta con Google Maps');
      }

      console.log('✅ Ruta calculada exitosamente con Google Maps:', result);
      setRouteData(result);
      
      toast.success(
        `Ruta calculada: ${result.distance_km} km (${Math.round(result.duration_minutes / 60)}h ${result.duration_minutes % 60}m)`
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error calculando ruta con Google Maps:', err);
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
