
import { useCallback } from 'react';
import { useMapas } from './useMapas';
import { useAccurateGeocodingMexico } from './useAccurateGeocodingMexico';
import { Ubicacion } from '@/types/ubicaciones';

export const useUbicacionesGeocodificacion = () => {
  const { geocodificarDireccion, calcularRuta } = useMapas();
  const { geocodeByCodigoPostal } = useAccurateGeocodingMexico();

  const geocodificarUbicacion = useCallback(async (ubicacion: Ubicacion): Promise<Ubicacion> => {
    try {
      // Intentar con dirección completa primero
      const direccionCompleta = `${ubicacion.domicilio.calle} ${ubicacion.domicilio.numExterior || ''}, ${ubicacion.domicilio.colonia}, ${ubicacion.domicilio.municipio}, ${ubicacion.domicilio.estado}`.trim();
      
      let coordenadas = null;
      
      // Usar Mapbox para geocodificación precisa
      const resultado = await geocodificarDireccion(direccionCompleta);
      if (resultado && resultado.coordinates) {
        coordenadas = {
          latitud: resultado.coordinates.lat,
          longitud: resultado.coordinates.lng
        };
      }
      
      // Fallback a geocodificación por código postal
      if (!coordenadas) {
        const coordsCP = geocodeByCodigoPostal(ubicacion.domicilio.codigoPostal);
        if (coordsCP) {
          coordenadas = {
            latitud: coordsCP.lat,
            longitud: coordsCP.lng
          };
        }
      }

      return {
        ...ubicacion,
        coordenadas: coordenadas || undefined
      };
    } catch (error) {
      console.error('Error geocodificando ubicación:', error);
      return ubicacion;
    }
  }, [geocodificarDireccion, geocodeByCodigoPostal]);

  const calcularRutaCompleta = useCallback(async (ubicaciones: Ubicacion[]) => {
    try {
      const ubicacionesConCoordenadas = await Promise.all(
        ubicaciones.map(geocodificarUbicacion)
      );

      const coordenadas = ubicacionesConCoordenadas
        .filter(u => u.coordenadas)
        .map(u => ({
          lat: u.coordenadas!.latitud,
          lng: u.coordenadas!.longitud
        }));

      if (coordenadas.length < 2) {
        throw new Error('Se necesitan al menos 2 ubicaciones con coordenadas válidas');
      }

      const resultado = await calcularRuta(coordenadas);
      return resultado;
    } catch (error) {
      console.error('Error calculando ruta completa:', error);
      throw error;
    }
  }, [geocodificarUbicacion, calcularRuta]);

  const calcularDistanciaEntrePuntos = useCallback(async (origen: Ubicacion, destino: Ubicacion) => {
    try {
      const origenGeo = await geocodificarUbicacion(origen);
      const destinoGeo = await geocodificarUbicacion(destino);

      if (!origenGeo.coordenadas || !destinoGeo.coordenadas) {
        throw new Error('No se pudieron obtener coordenadas para origen o destino');
      }

      const resultado = await calcularRuta([
        { lat: origenGeo.coordenadas.latitud, lng: origenGeo.coordenadas.longitud },
        { lat: destinoGeo.coordenadas.latitud, lng: destinoGeo.coordenadas.longitud }
      ]);

      return resultado;
    } catch (error) {
      console.error('Error calculando distancia entre puntos:', error);
      throw error;
    }
  }, [geocodificarUbicacion, calcularRuta]);

  return {
    geocodificarUbicacion,
    calcularRutaCompleta,
    calcularDistanciaEntrePuntos
  };
};
