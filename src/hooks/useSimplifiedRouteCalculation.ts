import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ubicacion } from '@/types/ubicaciones';
import { useAccurateGeocodingMexico } from './useAccurateGeocodingMexico';

interface RouteResult {
  distancia: number;
  tiempo: number;
  geometry: any;
}

export const useSimplifiedRouteCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { geocodeByCodigoPostal } = useAccurateGeocodingMexico();

  const formatAddress = (domicilio: any): string => {
    return `${domicilio.calle} ${domicilio.numExterior || ''}, ${domicilio.colonia}, ${domicilio.municipio}, ${domicilio.estado}, ${domicilio.codigoPostal}, México`.trim();
  };

  const geocodeAddress = async (address: string): Promise<{ latitud: number; longitud: number } | null> => {
    try {
      // Try Mapbox geocoding first
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&country=mx&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { latitud: lat, longitud: lng };
      }
    } catch (error) {
      console.warn('Mapbox geocoding failed, trying postal code:', error);
    }
    
    return null;
  };

  const calculateAndPersist = async (ubicaciones: Ubicacion[]): Promise<RouteResult | null> => {
    console.log('🚀 [Simplified] Iniciando cálculo de ruta con Google Maps');
    setIsCalculating(true);
    setError(null);

    try {
      // 1. Obtener origen y destino
      const origen = ubicaciones.find(u => u.tipoUbicacion === 'Origen');
      const destino = ubicaciones.find(u => u.tipoUbicacion === 'Destino');
      
      if (!origen || !destino) {
        throw new Error('Faltan origen o destino');
      }

      console.log('📍 Origen:', origen);
      console.log('📍 Destino:', destino);

      // 2. Geocodificar si no tienen coordenadas
      let origenCoords = origen.coordenadas;
      if (!origenCoords) {
        const geocoded = geocodeByCodigoPostal(origen.domicilio.codigoPostal);
        if (geocoded) {
          origenCoords = { latitud: geocoded.lat, longitud: geocoded.lng };
        } else {
          const fallback = await geocodeAddress(formatAddress(origen.domicilio));
          if (fallback) origenCoords = fallback;
        }
      }

      let destinoCoords = destino.coordenadas;
      if (!destinoCoords) {
        const geocoded = geocodeByCodigoPostal(destino.domicilio.codigoPostal);
        if (geocoded) {
          destinoCoords = { latitud: geocoded.lat, longitud: geocoded.lng };
        } else {
          const fallback = await geocodeAddress(formatAddress(destino.domicilio));
          if (fallback) destinoCoords = fallback;
        }
      }

      if (!origenCoords || !destinoCoords) {
        throw new Error('No se pudieron obtener las coordenadas');
      }

      console.log('📍 Coordenadas origen:', origenCoords);
      console.log('📍 Coordenadas destino:', destinoCoords);

      // 3. Llamar a Google Directions
      console.log('🗺️ Llamando a Google Directions API...');
      const { data, error: functionError } = await supabase.functions.invoke('google-directions', {
        body: {
          origin: { lat: origenCoords.latitud, lng: origenCoords.longitud },
          destination: { lat: destinoCoords.latitud, lng: destinoCoords.longitud }
        }
      });

      if (functionError) {
        console.error('❌ Error de Edge Function:', functionError);
        throw new Error(functionError.message || 'Error llamando a Google Directions');
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Error calculando ruta');
      }

      console.log('✅ Ruta calculada con Google Maps:', data);

      const resultado: RouteResult = {
        distancia: data.distance_km,
        tiempo: data.duration_minutes,
        geometry: data.google_data
      };

      return resultado;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error en cálculo:', err);
      setError(errorMsg);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateAndPersist,
    isCalculating,
    error
  };
};
