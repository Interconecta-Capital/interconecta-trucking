
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Coordinates {
  lat: number;
  lng: number;
}

interface RealRouteData {
  distance_km: number;
  duration_minutes: number;
  route_geometry: any;
  success: boolean;
  google_data?: any;
  fallback?: boolean;
  fallback_reason?: string;
}

export const useRealGoogleMaps = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeData, setRouteData] = useState<RealRouteData | null>(null);

  const calcularRutaReal = async (
    origen: string | Coordinates,
    destino: string | Coordinates,
    waypoints?: Coordinates[]
  ): Promise<RealRouteData | null> => {
    setIsCalculating(true);
    
    try {
      console.log('🗺️ Calculando ruta real con Google Maps API');
      console.log('Origen:', origen);
      console.log('Destino:', destino);

      // Convertir direcciones a coordenadas si es necesario
      let origenCoords: Coordinates;
      let destinoCoords: Coordinates;

      if (typeof origen === 'string') {
        origenCoords = await geocodificarDireccion(origen);
      } else {
        origenCoords = origen;
      }

      if (typeof destino === 'string') {
        destinoCoords = await geocodificarDireccion(destino);
      } else {
        destinoCoords = destino;
      }

      // Llamar a la edge function real
      const { data, error } = await supabase.functions.invoke('google-directions', {
        body: {
          origin: origenCoords,
          destination: destinoCoords,
          waypoints: waypoints || []
        }
      });

      if (error) {
        console.error('❌ Error en Google Directions:', error);
        toast.error('Error al calcular la ruta con Google Maps');
        return null;
      }

      if (!data || !data.success) {
        console.error('❌ Respuesta inválida de Google Maps:', data);
        toast.error('No se pudo calcular la ruta');
        return null;
      }

      console.log('✅ Ruta calculada exitosamente:', data);
      
      if (data.fallback) {
        toast.warning(`Usando cálculo estimado: ${data.fallback_reason}`);
      } else {
        toast.success(`Ruta calculada: ${data.distance_km} km (${Math.round(data.duration_minutes / 60)}h ${data.duration_minutes % 60}m)`);
      }

      setRouteData(data);
      return data;

    } catch (error) {
      console.error('❌ Error calculando ruta:', error);
      toast.error('Error de conexión al calcular la ruta');
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  const geocodificarDireccion = async (direccion: string): Promise<Coordinates> => {
    // Extraer código postal de la dirección para obtener coordenadas aproximadas
    const cpMatch = direccion.match(/\b\d{5}\b/);
    
    if (cpMatch) {
      const cp = cpMatch[0];
      const coordenadasPorCP: { [key: string]: Coordinates } = {
        '01000': { lat: 19.4326, lng: -99.1332 }, // CDMX Centro
        '03100': { lat: 19.3927, lng: -99.1588 }, // Del Valle
        '06700': { lat: 19.4284, lng: -99.1676 }, // Roma Norte
        '44100': { lat: 20.6597, lng: -103.3496 }, // Guadalajara Centro
        '64000': { lat: 25.6866, lng: -100.3161 }, // Monterrey Centro
        '22000': { lat: 32.5149, lng: -117.0382 }, // Tijuana
        '87000': { lat: 25.7785, lng: -108.9844 }, // Cd. Obregón
        '80000': { lat: 25.7683, lng: -108.2270 }, // Culiacán
      };

      return coordenadasPorCP[cp] || { lat: 19.4326, lng: -99.1332 };
    }

    // Coordenadas por defecto (CDMX)
    return { lat: 19.4326, lng: -99.1332 };
  };

  const limpiarRuta = () => {
    setRouteData(null);
  };

  return {
    calcularRutaReal,
    isCalculating,
    routeData,
    limpiarRuta
  };
};
