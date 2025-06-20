
import { useState, useCallback } from 'react';
import { Ubicacion } from '@/types/ubicaciones';

interface Coordinates {
  lat: number;
  lng: number;
}

export function useRouteGeocoding() {
  // Coordenadas basadas en código postal (simplificado para testing)
  const cpMap: { [key: string]: Coordinates } = {
    // México principales
    '01000': { lat: 19.4326, lng: -99.1332 }, // CDMX Centro
    '03100': { lat: 19.3927, lng: -99.1588 }, // Del Valle
    '06700': { lat: 19.4284, lng: -99.1676 }, // Roma Norte
    '11000': { lat: 19.4069, lng: -99.1716 }, // San Miguel Chapultepec
    '62577': { lat: 18.8711, lng: -99.2211 }, // Jiutepec, Morelos
    '22000': { lat: 32.5149, lng: -117.0382 }, // Tijuana, BC
  };

  // Función de geocodificación mejorada para coordenadas
  const geocodeLocation = useCallback(async (ubicacion: Ubicacion): Promise<Coordinates | null> => {
    // Si ya tiene coordenadas, usarlas
    if (ubicacion.coordenadas) {
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }

    const coords = cpMap[ubicacion.domicilio.codigoPostal];
    if (coords) {
      console.log(`📍 Coordenadas encontradas para CP ${ubicacion.domicilio.codigoPostal}:`, coords);
      return coords;
    }

    // Coordenadas por defecto para México si no se encuentra
    console.log(`⚠️ CP ${ubicacion.domicilio.codigoPostal} no encontrado, usando coordenadas por defecto`);
    return { lat: 19.4326, lng: -99.1332 };
  }, []);

  const geocodeMultipleLocations = useCallback(async (ubicaciones: Ubicacion[]): Promise<{
    origenCoords: Coordinates | null;
    destinoCoords: Coordinates | null;
    waypoints: Coordinates[];
  }> => {
    const origen = ubicaciones.find(u => u.tipoUbicacion === 'Origen');
    const destino = ubicaciones.find(u => u.tipoUbicacion === 'Destino');
    const intermedios = ubicaciones.filter(u => u.tipoUbicacion === 'Paso Intermedio');

    // Geocodificar ubicaciones
    const origenCoords = origen ? await geocodeLocation(origen) : null;
    const destinoCoords = destino ? await geocodeLocation(destino) : null;
    
    // Geocodificar intermedios si existen
    const waypoints: Coordinates[] = [];
    for (const intermedio of intermedios) {
      const coords = await geocodeLocation(intermedio);
      if (coords) waypoints.push(coords);
    }

    return { origenCoords, destinoCoords, waypoints };
  }, [geocodeLocation]);

  return {
    geocodeLocation,
    geocodeMultipleLocations
  };
}
