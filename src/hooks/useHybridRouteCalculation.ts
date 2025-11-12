
import { useState, useCallback } from 'react';
import { useGoogleMapsAPI } from './useGoogleMapsAPI';
import { supabase } from '@/integrations/supabase/client';

interface RouteResult {
  success: boolean;
  distance_km: number;
  duration_minutes: number;
  google_data?: any;
  source: 'google' | 'estimation';
}

export const useHybridRouteCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoaded: isGoogleLoaded } = useGoogleMapsAPI();

  const calculateRoute = useCallback(async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints: { lat: number; lng: number }[] = []
  ): Promise<RouteResult | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      console.log('🚀 Starting Google Maps route calculation');
      
      // Try Google Directions Edge Function
      try {
        console.log('📍 Calling Google Directions Edge Function...');
        
        const { data, error: functionError } = await supabase.functions.invoke('google-directions', {
          body: {
            origin,
            destination,
            waypoints: waypoints.length > 0 ? waypoints : undefined
          }
        });

        if (functionError) {
          console.error('❌ Edge Function error:', functionError);
          throw new Error(functionError.message);
        }

        if (data && data.success) {
          const routeResult: RouteResult = {
            success: true,
            distance_km: data.distance_km,
            duration_minutes: data.duration_minutes,
            google_data: data.google_data,
            source: 'google'
          };

          console.log('✅ Google Maps calculation successful:', routeResult);
          setRouteData(routeResult);
          return routeResult;
        }
      } catch (googleError) {
        console.warn('⚠️ Google Maps calculation failed, using estimation:', googleError);
      }

      // Final fallback: estimation
      console.log('📍 Using distance estimation...');
      
      const estimatedDistance = calculateHaversineDistance(origin, destination);
      const estimatedTime = Math.round(estimatedDistance * 1.2); // ~1.2 minutes per km
      
      const routeResult: RouteResult = {
        success: true,
        distance_km: Math.round(estimatedDistance),
        duration_minutes: estimatedTime,
        source: 'estimation'
      };

      console.log('✅ Estimation calculation:', routeResult);
      setRouteData(routeResult);
      return routeResult;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error calculating route';
      console.error('❌ Route calculation failed:', error);
      setError(errorMsg);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [isGoogleLoaded]);

  // Haversine distance formula for estimation
  const calculateHaversineDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return {
    calculateRoute,
    isCalculating,
    routeData,
    error
  };
};
