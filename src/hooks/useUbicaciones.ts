
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { mapService, Coordinates } from '@/services/mapService';

export interface Ubicacion {
  id?: string;
  idUbicacion: string;
  tipoUbicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
  rfcRemitenteDestinatario: string;
  nombreRemitenteDestinatario: string;
  fechaHoraSalidaLlegada?: string;
  distanciaRecorrida?: number;
  ordenSecuencia?: number;
  coordenadas?: Coordinates; // Nueva propiedad para coordenadas
  domicilio: {
    pais: string;
    codigoPostal: string;
    estado: string;
    municipio: string;
    localidad?: string;
    colonia: string;
    calle: string;
    numExterior: string;
    numInterior?: string;
    referencia?: string;
  };
}

export interface UbicacionFrecuente {
  id: string;
  nombreUbicacion: string;
  rfcAsociado: string;
  domicilio: Ubicacion['domicilio'];
  coordenadas?: Coordinates; // Nueva propiedad
  usoCount: number;
}

export const useUbicaciones = (cartaPorteId?: string) => {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [rutaCalculada, setRutaCalculada] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener ubicaciones frecuentes
  const { data: ubicacionesFrecuentes = [], isLoading: loadingFrecuentes } = useQuery({
    queryKey: ['ubicaciones-frecuentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ubicaciones_frecuentes')
        .select('*')
        .order('uso_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        nombreUbicacion: item.nombre_ubicacion,
        rfcAsociado: item.rfc_asociado,
        domicilio: item.domicilio,
        coordenadas: item.coordenadas || undefined, // Handle missing coordenadas property
        usoCount: item.uso_count
      })) as UbicacionFrecuente[];
    },
  });

  // Mutation para guardar ubicación frecuente
  const guardarUbicacionFrecuente = useMutation({
    mutationFn: async (ubicacion: Omit<UbicacionFrecuente, 'id' | 'usoCount'>) => {
      const { data, error } = await supabase
        .from('ubicaciones_frecuentes')
        .upsert({
          nombre_ubicacion: ubicacion.nombreUbicacion,
          rfc_asociado: ubicacion.rfcAsociado,
          domicilio: ubicacion.domicilio,
          coordenadas: ubicacion.coordenadas,
          uso_count: 1
        }, {
          onConflict: 'rfc_asociado,domicilio'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ubicaciones-frecuentes'] });
      toast({
        title: "Ubicación guardada",
        description: "La ubicación se ha guardado en favoritos.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la ubicación.",
        variant: "destructive",
      });
    },
  });

  const agregarUbicacion = useCallback((ubicacion: Ubicacion) => {
    setUbicaciones(prev => [...prev, ubicacion]);
  }, []);

  const actualizarUbicacion = useCallback((index: number, ubicacion: Ubicacion) => {
    setUbicaciones(prev => prev.map((u, i) => i === index ? ubicacion : u));
  }, []);

  const eliminarUbicacion = useCallback((index: number) => {
    setUbicaciones(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reordenarUbicaciones = useCallback((startIndex: number, endIndex: number) => {
    setUbicaciones(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Actualizar orden de secuencia
      return result.map((ubicacion, index) => ({
        ...ubicacion,
        ordenSecuencia: index + 1
      }));
    });
  }, []);

  // Nueva función: Geocodificar ubicación automáticamente
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

  // Nueva función: Calcular distancias automáticamente
  const calcularDistanciasAutomaticas = useCallback(async () => {
    if (ubicaciones.length < 2) return;

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

      setUbicaciones(ubicacionesConDistancias);

      toast({
        title: "Distancias calculadas",
        description: "Las distancias entre ubicaciones han sido calculadas automáticamente.",
      });
    } catch (error) {
      console.error('Error calculando distancias:', error);
      toast({
        title: "Error",
        description: "No se pudieron calcular las distancias automáticamente.",
        variant: "destructive",
      });
    }
  }, [ubicaciones, geocodificarUbicacion]);

  // Nueva función: Calcular ruta completa
  const calcularRutaCompleta = useCallback(async () => {
    if (ubicaciones.length < 2) return;

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
        setRutaCalculada(ruta);

        if (ruta) {
          toast({
            title: "Ruta calculada",
            description: `Distancia total: ${ruta.distance} km, Tiempo estimado: ${ruta.duration} min`,
          });
        }
      }
    } catch (error) {
      console.error('Error calculando ruta completa:', error);
      toast({
        title: "Error",
        description: "No se pudo calcular la ruta completa.",
        variant: "destructive",
      });
    }
  }, [ubicaciones, geocodificarUbicacion]);

  const calcularDistanciaTotal = useCallback(() => {
    return ubicaciones.reduce((total, ubicacion) => {
      return total + (ubicacion.distanciaRecorrida || 0);
    }, 0);
  }, [ubicaciones]);

  const validarSecuenciaUbicaciones = useCallback(() => {
    const tieneOrigen = ubicaciones.some(u => u.tipoUbicacion === 'Origen');
    const tieneDestino = ubicaciones.some(u => u.tipoUbicacion === 'Destino');
    const tieneMinimo = ubicaciones.length >= 2;
    
    return {
      esValido: tieneOrigen && tieneDestino && tieneMinimo,
      errores: [
        ...(!tieneOrigen ? ['Falta ubicación de origen'] : []),
        ...(!tieneDestino ? ['Falta ubicación de destino'] : []),
        ...(!tieneMinimo ? ['Se requieren al menos 2 ubicaciones'] : [])
      ]
    };
  }, [ubicaciones]);

  const generarIdUbicacion = useCallback((tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => {
    const prefix = tipo === 'Origen' ? 'OR' : tipo === 'Destino' ? 'DE' : 'IN';
    const count = ubicaciones.filter(u => u.tipoUbicacion === tipo).length + 1;
    return `${prefix}${count.toString().padStart(6, '0')}`;
  }, [ubicaciones]);

  return {
    ubicaciones,
    setUbicaciones,
    ubicacionesFrecuentes,
    loadingFrecuentes,
    rutaCalculada,
    agregarUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
    reordenarUbicaciones,
    calcularDistanciaTotal,
    validarSecuenciaUbicaciones,
    generarIdUbicacion,
    guardarUbicacionFrecuente: guardarUbicacionFrecuente.mutate,
    isGuardando: guardarUbicacionFrecuente.isPending,
    
    // Nuevas funciones de mapas
    geocodificarUbicacion,
    calcularDistanciasAutomaticas,
    calcularRutaCompleta,
  };
};
