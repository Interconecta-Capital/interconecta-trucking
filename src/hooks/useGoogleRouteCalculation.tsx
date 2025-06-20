
import { useState } from 'react';
import { googleMapsService } from '@/services/googleMapsService';

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteCalculationResult {
  success: boolean;
  distance_km?: number;
  duration_minutes?: number;
  route_geometry?: any;
  error?: string;
  fallback?: boolean;
  fallback_reason?: string;
}

export function useGoogleRouteCalculation() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeData, setRouteData] = useState<RouteCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = async (
    origin: Coordinates,
    destination: Coordinates,
    waypoints?: Coordinates[]
  ): Promise<RouteCalculationResult | null> => {
    setIsCalculating(true);
    setError(null);
    setRouteData(null);

    try {
      console.log('🗺️ Iniciando cálculo de ruta...');
      console.log('Origen:', origin);
      console.log('Destino:', destination);

      const result = await googleMapsService.calculateRoute(origin, destination, waypoints);
      
      if (!result) {
        // Si Google Maps falla, usar cálculo de respaldo
        console.log('⚠️ Google Maps no disponible, usando cálculo de respaldo');
        const fallbackResult = calculateFallbackDistance(origin, destination);
        
        const fallbackData: RouteCalculationResult = {
          success: true,
          distance_km: fallbackResult.distance_km,
          duration_minutes: fallbackResult.duration_minutes,
          fallback: true,
          fallback_reason: 'Google Maps service unavailable'
        };

        setRouteData(fallbackData);
        return fallbackData;
      }

      console.log('✅ Ruta calculada exitosamente:', result);
      setRouteData(result);
      return result;

    } catch (err) {
      console.error('❌ Error en cálculo de ruta:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      
      // Usar cálculo de respaldo en caso de error
      const fallbackResult = calculateFallbackDistance(origin, destination);
      const fallbackData: RouteCalculationResult = {
        success: true,
        distance_km: fallbackResult.distance_km,
        duration_minutes: fallbackResult.duration_minutes,
        fallback: true,
        fallback_reason: 'Error in Google Maps calculation'
      };

      setRouteData(fallbackData);
      return fallbackData;

    } finally {
      setIsCalculating(false);
    }
  };

  const calculateFallbackDistance = (origin: Coordinates, destination: Coordinates) => {
    // Cálculo simple usando fórmula de Haversine
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(destination.lat - origin.lat);
    const dLon = toRad(destination.lng - origin.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance_km = Math.round(R * c);
    
    // Estimar duración (asumiendo 80 km/h promedio)
    const duration_minutes = Math.round((distance_km / 80) * 60);

    return { distance_km, duration_minutes };
  };

  const toRad = (deg: number) => deg * (Math.PI / 180);

  const validateWeightCapacity = (
    pesoMercancia: number, 
    capacidadVehiculo: number
  ): { isValid: boolean; warning?: string } => {
    if (pesoMercancia > capacidadVehiculo) {
      return {
        isValid: false,
        warning: `El peso de la mercancía (${pesoMercancia} kg) excede la capacidad del vehículo (${capacidadVehiculo} kg)`
      };
    }

    if (pesoMercancia > capacidadVehiculo * 0.9) {
      return {
        isValid: true,
        warning: `Carga cercana al límite (${Math.round((pesoMercancia / capacidadVehiculo) * 100)}% de capacidad)`
      };
    }

    return { isValid: true };
  };

  return {
    calculateRoute,
    validateWeightCapacity,
    isCalculating,
    routeData,
    error
  };
}
