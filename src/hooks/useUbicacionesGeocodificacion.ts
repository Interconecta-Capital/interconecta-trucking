
import { useCallback } from 'react';
import { Ubicacion, Coordinates } from '@/types/ubicaciones';

export const useUbicacionesGeocodificacion = () => {
  const geocodificarUbicacion = useCallback(async (ubicacion: Ubicacion) => {
    try {
      // Mock geocoding - in production this would use a real geocoding service
      const mockCoords: Coordinates = {
        lat: 19.4326,
        lng: -99.1332,
        latitud: 19.4326,
        longitud: -99.1332
      };
      
      return {
        ...ubicacion,
        coordenadas: {
          latitud: mockCoords.latitud!,
          longitud: mockCoords.longitud!
        }
      };
    } catch (error) {
      console.error('Error geocodificando ubicación:', error);
      return ubicacion;
    }
  }, []);

  const calcularDistanciaEntrePuntos = useCallback((
    coords1: { latitud: number; longitud: number },
    coords2: { latitud: number; longitud: number }
  ): number => {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (coords2.latitud - coords1.latitud) * Math.PI / 180;
    const dLon = (coords2.longitud - coords1.longitud) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coords1.latitud * Math.PI / 180) * Math.cos(coords2.latitud * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const calcularDistanciasAutomaticas = useCallback(async (ubicaciones: Ubicacion[]): Promise<Ubicacion[]> => {
    if (ubicaciones.length < 2) return ubicaciones;

    const ubicacionesConDistancia = [...ubicaciones];
    
    for (let i = 1; i < ubicacionesConDistancia.length; i++) {
      const anterior = ubicacionesConDistancia[i - 1];
      const actual = ubicacionesConDistancia[i];
      
      if (anterior.coordenadas && actual.coordenadas) {
        const distancia = calcularDistanciaEntrePuntos(
          { latitud: anterior.coordenadas.latitud, longitud: anterior.coordenadas.longitud },
          { latitud: actual.coordenadas.latitud, longitud: actual.coordenadas.longitud }
        );
        
        ubicacionesConDistancia[i] = {
          ...actual,
          distanciaRecorrida: Math.round(distancia)
        };
      }
    }
    
    return ubicacionesConDistancia;
  }, [calcularDistanciaEntrePuntos]);

  const calcularRutaCompleta = useCallback(async (ubicaciones: Ubicacion[]) => {
    try {
      // Mock route calculation - in production this would use a routing service
      if (ubicaciones.length < 2) return null;
      
      const coordenadasRuta = ubicaciones
        .filter(u => u.coordenadas)
        .map(u => ({ latitud: u.coordenadas!.latitud, longitud: u.coordenadas!.longitud }));
      
      return {
        coordenadas: coordenadasRuta,
        distanciaTotal: ubicaciones.reduce((total, u) => total + (u.distanciaRecorrida || 0), 0),
        tiempoEstimado: Math.round(coordenadasRuta.length * 60) // Mock: 60 minutes per location
      };
    } catch (error) {
      console.error('Error calculando ruta completa:', error);
      return null;
    }
  }, []);

  return {
    geocodificarUbicacion,
    calcularDistanciasAutomaticas,
    calcularRutaCompleta,
    calcularDistanciaEntrePuntos
  };
};
