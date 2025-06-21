
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteCalculationResult {
  success: boolean;
  distance_km: number;
  duration_minutes: number;
  fallback?: boolean;
  fallback_reason?: string;
  google_data?: any;
  error?: string;
}

export const useGoogleRouteCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeData, setRouteData] = useState<RouteCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(async (
    origin: Coordinates,
    destination: Coordinates,
    waypoints?: Coordinates[]
  ): Promise<RouteCalculationResult | null> => {
    console.log('🗺️ Iniciando cálculo de ruta con Google Directions API');
    
    setIsCalculating(true);
    setError(null);
    
    try {
      // Llamar a la Edge Function de Supabase
      const { data, error: functionError } = await supabase.functions.invoke('google-directions', {
        body: {
          origin,
          destination,
          waypoints: waypoints || []
        }
      });

      if (functionError) {
        console.error('❌ Error en Edge Function:', functionError);
        setError(`Error de servidor: ${functionError.message}`);
        return null;
      }

      if (!data) {
        console.error('❌ No se recibieron datos de la función');
        setError('No se pudieron obtener datos de ruta');
        return null;
      }

      console.log('✅ Respuesta de Google Directions:', data);
      
      if (data.success) {
        setRouteData(data);
        
        if (data.fallback) {
          console.log('⚠️ Usando cálculo de distancia estimado:', data.fallback_reason);
        } else {
          console.log('🎯 Ruta calculada con Google Maps API exitosamente');
        }
        
        return data;
      } else {
        console.error('❌ Error calculando ruta:', data.error);
        setError(data.error || 'Error desconocido');
        return null;
      }

    } catch (err) {
      console.error('❌ Error en calculateRoute:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const resetRouteData = useCallback(() => {
    setRouteData(null);
    setError(null);
  }, []);

  return {
    calculateRoute,
    isCalculating,
    routeData,
    error,
    resetRouteData
  };
};
