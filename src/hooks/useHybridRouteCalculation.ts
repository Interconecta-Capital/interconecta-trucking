
import { useState, useCallback } from 'react';
import { useMapas } from './useMapas';
import { useGoogleMapsAPI } from './useGoogleMapsAPI';

interface RouteResult {
  success: boolean;
  distance_km: number;
  duration_minutes: number;
  google_data?: any;
  mapbox_data?: any;
  source: 'google' | 'mapbox' | 'estimation';
}

export const useHybridRouteCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { calcularRuta: mapboxRoute } = useMapas();
  const { isLoaded: isGoogleLoaded } = useGoogleMapsAPI();

  const calculateRoute = useCallback(async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints: { lat: number; lng: number }[] = []
  ): Promise<RouteResult | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      console.log('🚀 Starting hybrid route calculation');
      
      // Try Google Maps first if available
      if (isGoogleLoaded && window.google?.maps?.DirectionsService) {
        try {
          console.log('📍 Attempting Google Maps calculation...');
          
          const directionsService = new window.google.maps.DirectionsService();
          
          const wayPointsFormatted = waypoints.map(point => ({
            location: new window.google.maps.LatLng(point.lat, point.lng),
            stopover: true
          }));

          const request = {
            origin: new window.google.maps.LatLng(origin.lat, origin.lng),
            destination: new window.google.maps.LatLng(destination.lat, destination.lng),
            waypoints: wayPointsFormatted,
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
            optimizeWaypoints: true
          };

          const result = await new Promise<any>((resolve, reject) => {
            directionsService.route(request, (response, status) => {
              if (status === 'OK') {
                resolve(response);
              } else {
                reject(new Error(`Google Directions error: ${status}`));
              }
            });
          });

          if (result && result.routes[0]) {
            const route = result.routes[0];
            let totalDistance = 0;
            let totalDuration = 0;

            route.legs.forEach((leg: any) => {
              totalDistance += leg.distance.value;
              totalDuration += leg.duration.value;
            });

            const routeResult: RouteResult = {
              success: true,
              distance_km: Math.round(totalDistance / 1000 * 100) / 100,
              duration_minutes: Math.round(totalDuration / 60),
              google_data: {
                polyline: route.overview_polyline.points,
                bounds: route.bounds,
                legs: route.legs
              },
              source: 'google'
            };

            console.log('✅ Google Maps calculation successful:', routeResult);
            setRouteData(routeResult);
            return routeResult;
          }
        } catch (googleError) {
          console.warn('⚠️ Google Maps calculation failed, falling back to Mapbox:', googleError);
        }
      }

      // Fallback to Mapbox
      console.log('📍 Attempting Mapbox calculation...');
      
      const allPoints = [origin, ...waypoints, destination];
      const mapboxResult = await mapboxRoute(allPoints);
      
      if (mapboxResult) {
        const routeResult: RouteResult = {
          success: true,
          distance_km: mapboxResult.distance,
          duration_minutes: mapboxResult.duration,
          mapbox_data: mapboxResult.geometry,
          source: 'mapbox'
        };

        console.log('✅ Mapbox calculation successful:', routeResult);
        setRouteData(routeResult);
        return routeResult;
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
  }, [isGoogleLoaded, mapboxRoute]);

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
