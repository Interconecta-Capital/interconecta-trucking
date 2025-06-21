
import { useState, useCallback } from 'react';
import { GeocodeResult, mapService } from '@/services/mapService';

export const useMapas = () => {
  const [isLoading, setIsLoading] = useState(false);

  const buscarDirecciones = useCallback(async (query: string): Promise<GeocodeResult[]> => {
    if (!query || query.length < 3) return [];
    
    setIsLoading(true);
    try {
      const results = await mapService.searchAddresses(query);
      return results;
    } catch (error) {
      console.error('Error buscando direcciones:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const geocodificarDireccion = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    setIsLoading(true);
    try {
      const result = await mapService.geocodeAddress(address);
      return result;
    } catch (error) {
      console.error('Error geocodificando dirección:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calcularRuta = useCallback(async (points: { lat: number; lng: number }[]) => {
    if (points.length < 2) return null;
    
    setIsLoading(true);
    try {
      const result = await mapService.calculateRoute(points);
      return result;
    } catch (error) {
      console.error('Error calculando ruta:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    buscarDirecciones,
    geocodificarDireccion,
    calcularRuta,
    isLoading
  };
};
