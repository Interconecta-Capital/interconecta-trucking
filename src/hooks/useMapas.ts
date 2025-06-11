
import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { mapService, Coordinates, RouteResult, GeocodeResult } from '@/services/mapService';
import { useToast } from '@/hooks/use-toast';
import { Ubicacion } from '@/hooks/useUbicaciones';

export const useMapas = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  // Geocodificar dirección
  const geocodificarDireccion = useMutation({
    mutationFn: async (address: string) => {
      return await mapService.geocodeAddress(address);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo geocodificar la dirección",
        variant: "destructive",
      });
    },
  });

  // Buscar direcciones con autocompletado
  const buscarDirecciones = useCallback(async (query: string): Promise<GeocodeResult[]> => {
    try {
      return await mapService.searchAddresses(query);
    } catch (error) {
      console.error('Error buscando direcciones:', error);
      return [];
    }
  }, []);

  // Calcular ruta entre ubicaciones
  const calcularRuta = useMutation({
    mutationFn: async (ubicaciones: Ubicacion[]) => {
      setIsCalculating(true);
      
      try {
        // Primero geocodificar todas las direcciones si no tienen coordenadas
        const coordenadas: Coordinates[] = [];
        
        for (const ubicacion of ubicaciones) {
          const address = `${ubicacion.domicilio.calle} ${ubicacion.domicilio.numExterior}, ${ubicacion.domicilio.colonia}, ${ubicacion.domicilio.municipio}, ${ubicacion.domicilio.estado}, ${ubicacion.domicilio.codigoPostal}`;
          
          const geocoded = await mapService.geocodeAddress(address);
          
          if (geocoded) {
            coordenadas.push(geocoded.coordinates);
          } else {
            throw new Error(`No se pudo geocodificar: ${ubicacion.nombreRemitenteDestinatario}`);
          }
        }

        // Calcular ruta
        const ruta = await mapService.calculateRoute(coordenadas);
        
        if (!ruta) {
          throw new Error('No se pudo calcular la ruta');
        }

        return {
          ruta,
          ubicacionesConCoordenadas: ubicaciones.map((ubicacion, index) => ({
            ...ubicacion,
            coordenadas: coordenadas[index]
          }))
        };
      } finally {
        setIsCalculating(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Ruta calculada",
        description: `Distancia total: ${data.ruta.distance} km, Tiempo estimado: ${data.ruta.duration} min`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo calcular la ruta",
        variant: "destructive",
      });
    },
  });

  // Optimizar orden de ubicaciones
  const optimizarRuta = useMutation({
    mutationFn: async (ubicaciones: Ubicacion[]) => {
      if (ubicaciones.length < 3) {
        throw new Error('Se necesitan al menos 3 ubicaciones para optimizar');
      }

      // Geocodificar ubicaciones
      const coordenadas: Coordinates[] = [];
      
      for (const ubicacion of ubicaciones) {
        const address = `${ubicacion.domicilio.calle} ${ubicacion.domicilio.numExterior}, ${ubicacion.domicilio.colonia}, ${ubicacion.domicilio.municipio}, ${ubicacion.domicilio.estado}, ${ubicacion.domicilio.codigoPostal}`;
        
        const geocoded = await mapService.geocodeAddress(address);
        
        if (geocoded) {
          coordenadas.push(geocoded.coordinates);
        } else {
          throw new Error(`No se pudo geocodificar: ${ubicacion.nombreRemitenteDestinatario}`);
        }
      }

      const optimized = await mapService.optimizeRoute(coordenadas);
      
      if (!optimized) {
        throw new Error('No se pudo optimizar la ruta');
      }

      return optimized;
    },
    onSuccess: (data) => {
      toast({
        title: "Ruta optimizada",
        description: `Nueva distancia total: ${data.totalDistance} km`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo optimizar la ruta",
        variant: "destructive",
      });
    },
  });

  // Validar dirección
  const validarDireccion = useCallback(async (address: string): Promise<boolean> => {
    try {
      return await mapService.validateAddress(address);
    } catch (error) {
      console.error('Error validando dirección:', error);
      return false;
    }
  }, []);

  // Calcular distancia entre dos puntos específicos
  const calcularDistanciaPuntos = useCallback(async (origen: Coordinates, destino: Coordinates): Promise<number | null> => {
    try {
      const ruta = await mapService.calculateRoute([origen, destino]);
      return ruta?.distance || null;
    } catch (error) {
      console.error('Error calculando distancia entre puntos:', error);
      return null;
    }
  }, []);

  return {
    // Estados
    isCalculating,
    isGeocoding: geocodificarDireccion.isPending,
    isOptimizing: optimizarRuta.isPending,

    // Funciones
    geocodificarDireccion: geocodificarDireccion.mutate,
    buscarDirecciones,
    calcularRuta: calcularRuta.mutate,
    optimizarRuta: optimizarRuta.mutate,
    validarDireccion,
    calcularDistanciaPuntos,

    // Datos
    rutaCalculada: calcularRuta.data,
    rutaOptimizada: optimizarRuta.data,
  };
};
