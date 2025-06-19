
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RoutePoint {
  lat: number;
  lng: number;
}

interface RouteResult {
  distance_km: number;
  duration_minutes: number;
  route_geometry: {
    type: string;
    coordinates: number[][];
  };
  success: boolean;
}

export function useRouteCalculation() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = async (
    origin: RoutePoint,
    destination: RoutePoint,
    waypoints?: RoutePoint[]
  ): Promise<RouteResult | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      console.log('🚀 Iniciando cálculo de ruta con Edge Function');
      
      const { data, error: functionError } = await supabase.functions.invoke('calculate-route', {
        body: {
          origin,
          destination,
          waypoints
        }
      });

      if (functionError) {
        console.error('❌ Error en Edge Function:', functionError);
        throw new Error(functionError.message || 'Error al calcular la ruta');
      }

      if (!data || !data.success) {
        console.error('❌ Respuesta inválida de Edge Function:', data);
        throw new Error(data?.error || 'No se pudo calcular la ruta');
      }

      console.log('✅ Ruta calculada exitosamente:', data);
      setRouteData(data);
      
      toast.success(
        `Ruta calculada: ${data.distance_km} km (${Math.round(data.duration_minutes / 60)}h ${data.duration_minutes % 60}m)`
      );

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error calculando ruta:', err);
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
