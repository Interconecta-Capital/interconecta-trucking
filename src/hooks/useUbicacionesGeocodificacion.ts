
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mapService, Coordinates } from '@/services/mapService';
import { Ubicacion } from '@/types/ubicaciones';

export const useUbicacionesGeocodificacion = () => {
  const { toast } = useToast();

  // Geocodificar ubicación automáticamente
  const geocodificarUbicacion = useCallback(async (ubicacion: Ubicacion): Promise<Ubicacion> => {
    const address = `${ubicacion.domicilio.calle} ${ubicacion.domicilio.numExterior}, ${ubicacion.domicilio.colonia}, ${ubicacion.domicilio.municipio}, ${ubicacion.domicilio.estado}, ${ubicacion.domicilio.codigoPostal}`;
    
    try {
      const resultado = await mapService.geocodeAddress(address);
      
      if (resultado) {
        return {
          ...ubicacion,
          coordenadas: resultado.coordinates
        };
      }
    } catch (error) {
      console.error('Error geocodificando ubicación:', error);
    }
    
    return ubicacion;
  }, []);

  // Calcular distancias automáticamente
  const calcularDistanciasAutomaticas = useCallback(async (ubicaciones: Ubicacion[]): Promise<Ubicacion[]> => {
    if (ubicaciones.length < 2) return ubicaciones;

    try {
      // Geocodificar todas las ubicaciones primero
      const ubicacionesConCoordenadas = await Promise.all(
        ubicaciones.map(geocodificarUbicacion)
      );

      // Calcular distancias entre puntos consecutivos
      const ubicacionesConDistancias = await Promise.all(
        ubicacionesConCoordenadas.map(async (ubicacion, index) => {
          if (index === 0) return ubicacion; // El primer punto no tiene distancia recorrida

          const puntoAnterior = ubicacionesConCoordenadas[index - 1];
          
          if (ubicacion.coordenadas && puntoAnterior.coordenadas) {
            const ruta = await mapService.calculateRoute([
              puntoAnterior.coordenadas,
              ubicacion.coordenadas
            ]);

            return {
              ...ubicacion,
              distanciaRecorrida: ruta?.distance || 0
            };
          }

          return ubicacion;
        })
      );

      toast({
        title: "Distancias calculadas",
        description: "Las distancias entre ubicaciones han sido calculadas automáticamente.",
      });

      return ubicacionesConDistancias;
    } catch (error) {
      console.error('Error calculando distancias:', error);
      toast({
        title: "Error",
        description: "No se pudieron calcular las distancias automáticamente.",
        variant: "destructive",
      });
      return ubicaciones;
    }
  }, [geocodificarUbicacion, toast]);

  // Calcular ruta completa
  const calcularRutaCompleta = useCallback(async (ubicaciones: Ubicacion[]) => {
    if (ubicaciones.length < 2) return null;

    try {
      // Geocodificar ubicaciones
      const ubicacionesConCoordenadas = await Promise.all(
        ubicaciones.map(geocodificarUbicacion)
      );

      const coordenadas = ubicacionesConCoordenadas
        .map(u => u.coordenadas)
        .filter(Boolean) as Coordinates[];

      if (coordenadas.length >= 2) {
        const ruta = await mapService.calculateRoute(coordenadas);

        if (ruta) {
          toast({
            title: "Ruta calculada",
            description: `Distancia total: ${ruta.distance} km, Tiempo estimado: ${ruta.duration} min`,
          });
        }

        return ruta;
      }
    } catch (error) {
      console.error('Error calculando ruta completa:', error);
      toast({
        title: "Error",
        description: "No se pudo calcular la ruta completa.",
        variant: "destructive",
      });
    }

    return null;
  }, [geocodificarUbicacion, toast]);

  return {
    geocodificarUbicacion,
    calcularDistanciasAutomaticas,
    calcularRutaCompleta,
  };
};
