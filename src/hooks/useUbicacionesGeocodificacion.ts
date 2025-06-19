
import { useState } from 'react';
import { toast } from 'sonner';
import { Coordinates } from '@/types/ubicaciones';

export const useUbicacionesGeocodificacion = () => {
  const [isLoading, setIsLoading] = useState(false);

  const geocodificarDireccion = async (direccion: string): Promise<Coordinates | null> => {
    setIsLoading(true);
    try {
      // Mock implementation - replace with actual geocoding service
      const mockCoordinates: Coordinates = {
        latitud: 19.4326,
        longitud: -99.1332
      };
      
      return mockCoordinates;
    } catch (error) {
      console.error('Error en geocodificación:', error);
      toast.error('Error al obtener coordenadas');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    geocodificarDireccion,
    isLoading
  };
};
