
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RutaCalculationResult {
  distancia: number;
  tiempoEstimado: number;
  coordenadas: Array<{ lat: number; lng: number }>;
  ruta: string;
}

export const useRutaCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<RutaCalculationResult | null>(null);

  const calcularRutaConGoogle = useCallback(async (
    origen: string,
    destino: string
  ): Promise<RutaCalculationResult> => {
    setIsCalculating(true);
    
    try {
      console.log('🗺️ Calculando ruta:', { origen, destino });
      
      // Llamar a la función edge de Google Directions
      const { data, error } = await supabase.functions.invoke('google-directions', {
        body: {
          origin: origen,
          destination: destino,
          travelMode: 'DRIVING',
          language: 'es',
          region: 'mx'
        }
      });

      if (error) {
        console.error('❌ Error en Google Directions:', error);
        throw new Error('Error calculando la ruta: ' + error.message);
      }

      if (!data || !data.distance || !data.duration) {
        console.error('❌ Respuesta inválida de Google:', data);
        throw new Error('Datos de ruta inválidos recibidos');
      }

      const result: RutaCalculationResult = {
        distancia: Math.round(data.distance), // Distancia en km
        tiempoEstimado: Math.round(data.duration / 60), // Duración en minutos
        coordenadas: data.coordinates || [],
        ruta: `${origen} → ${destino}`
      };

      console.log('✅ Ruta calculada exitosamente:', result);
      setLastCalculation(result);
      
      return result;

    } catch (error) {
      console.error('❌ Error calculando ruta:', error);
      
      // Fallback con estimación básica
      const estimatedDistance = 550; // km (CDMX - Guadalajara aproximadamente)
      const estimatedTime = Math.round(estimatedDistance / 80 * 60); // 80 km/h promedio
      
      const fallbackResult: RutaCalculationResult = {
        distancia: estimatedDistance,
        tiempoEstimado: estimatedTime,
        coordenadas: [
          { lat: 19.4326, lng: -99.1332 }, // CDMX
          { lat: 20.6597, lng: -103.3496 }  // Guadalajara
        ],
        ruta: `${origen} → ${destino} (estimación)`
      };
      
      console.log('⚠️ Usando estimación de ruta:', fallbackResult);
      setLastCalculation(fallbackResult);
      
      return fallbackResult;
      
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const limpiarCalculacion = useCallback(() => {
    setLastCalculation(null);
  }, []);

  return {
    calcularRutaConGoogle,
    isCalculating,
    lastCalculation,
    limpiarCalculacion
  };
};
