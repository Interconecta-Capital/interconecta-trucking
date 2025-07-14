import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UbicacionPrecisa {
  nombre: string;
  direccion: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  codigoPostal: string;
  precision: 'alta' | 'media' | 'baja';
  validadaGoogleMaps: boolean;
}

interface RutaCalculada {
  distanciaKm: number;
  tiempoEstimadoMinutos: number;
  costoCombustible: number;
  peajes: number;
  rutaOptimizada: any[];
  precision: number;
  origen: UbicacionPrecisa;
  destino: UbicacionPrecisa;
}

export const useRutasPrecisas = () => {
  const [calculandoRuta, setCalculandoRuta] = useState(false);
  const [rutaActual, setRutaActual] = useState<RutaCalculada | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Geocodificar una dirección con alta precisión
   */
  const geocodificarDireccion = useCallback(async (direccion: string): Promise<UbicacionPrecisa | null> => {
    try {
      console.log('🔍 Iniciando geocodificación para:', direccion);
      
      // Llamar al Edge Function para geocodificación precisa
      const { data, error } = await supabase.functions.invoke('google-directions', {
        body: {
          action: 'geocode',
          address: direccion
        }
      });

      console.log('📡 Respuesta completa del edge function:', { data, error });

      // Si hay error de red o función
      if (error) {
        console.error('❌ Error de invocación de función:', error);
        throw new Error(`Error de conexión: ${error.message}`);
      }

      // Verificar si tenemos data
      if (!data) {
        console.error('❌ No se recibió respuesta de la función');
        throw new Error('No se recibió respuesta del servicio de geocodificación');
      }

      // Verificar success flag
      if (!data.success) {
        const errorMsg = data.error || 'Error desconocido en geocodificación';
        console.error('❌ Error específico de geocodificación:', errorMsg);
        throw new Error(errorMsg);
      }

      // Verificar que tenemos resultados
      if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
        console.error('❌ No se encontraron resultados para:', direccion);
        throw new Error('No se encontraron resultados para la dirección proporcionada');
      }

      const resultado = data.results[0];
      console.log('✅ Resultado de geocodificación:', resultado);

      // Verificar estructura del resultado
      if (!resultado.geometry || !resultado.geometry.location) {
        console.error('❌ Estructura de resultado inválida:', resultado);
        throw new Error('Respuesta de geocodificación con formato inválido');
      }

      const location = resultado.geometry.location;

      // Determinar precisión basada en el tipo de resultado
      let precision: 'alta' | 'media' | 'baja' = 'media';
      if (resultado.geometry.location_type === 'ROOFTOP') {
        precision = 'alta';
      } else if (resultado.geometry.location_type === 'RANGE_INTERPOLATED') {
        precision = 'media';
      } else {
        precision = 'baja';
      }

      // Extraer código postal
      let codigoPostal = '';
      if (resultado.address_components) {
        for (const component of resultado.address_components) {
          if (component.types && component.types.includes('postal_code')) {
            codigoPostal = component.long_name;
            break;
          }
        }
      }

      const ubicacionPrecisa = {
        nombre: resultado.formatted_address,
        direccion: resultado.formatted_address,
        coordenadas: {
          lat: location.lat,
          lng: location.lng
        },
        codigoPostal,
        precision,
        validadaGoogleMaps: true
      };

      console.log('✅ Geocodificación exitosa:', ubicacionPrecisa);
      return ubicacionPrecisa;

    } catch (error) {
      console.error('💥 Error completo en geocodificación:', error);
      console.error('📍 Dirección que falló:', direccion);
      return null;
    }
  }, []);

  /**
   * Calcular ruta optimizada entre dos puntos
   */
  const calcularRutaOptimizada = useCallback(async (
    origen: string | UbicacionPrecisa,
    destino: string | UbicacionPrecisa,
    opciones?: {
      evitarPeajes?: boolean;
      evitarAutopistas?: boolean;
      vehiculo?: {
        tipo: string;
        rendimiento: number; // km/litro
      };
    }
  ): Promise<RutaCalculada | null> => {
    setCalculandoRuta(true);
    setError(null);

    try {
      console.log('🗺️ Calculando ruta optimizada...', { origen, destino });

      // Geocodificar direcciones si son strings
      let origenPreciso: UbicacionPrecisa;
      let destinoPreciso: UbicacionPrecisa;

      if (typeof origen === 'string') {
        const result = await geocodificarDireccion(origen);
        if (!result) {
          throw new Error('No se pudo geocodificar la dirección de origen');
        }
        origenPreciso = result;
      } else {
        origenPreciso = origen;
      }

      if (typeof destino === 'string') {
        const result = await geocodificarDireccion(destino);
        if (!result) {
          throw new Error('No se pudo geocodificar la dirección de destino');
        }
        destinoPreciso = result;
      } else {
        destinoPreciso = destino;
      }

      // Llamar al Edge Function para calcular la ruta
      const { data, error } = await supabase.functions.invoke('google-directions', {
        body: {
          action: 'directions',
          origin: { lat: origenPreciso.coordenadas.lat, lng: origenPreciso.coordenadas.lng },
          destination: { lat: destinoPreciso.coordenadas.lat, lng: destinoPreciso.coordenadas.lng },
          avoid: [
            ...(opciones?.evitarPeajes ? ['tolls'] : []),
            ...(opciones?.evitarAutopistas ? ['highways'] : [])
          ],
          units: 'metric'
        }
      });

      console.log('📡 Respuesta de cálculo de ruta:', { data, error });

      if (error) {
        console.error('❌ Error calculando ruta:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No se recibió respuesta del servicio de rutas');
      }

      // La nueva estructura de respuesta unificada
      if (!data.success) {
        const errorMsg = data.error || 'Error desconocido calculando ruta';
        console.error('❌ Error específico de ruta:', errorMsg);
        throw new Error(errorMsg);
      }

      // Extraer datos de la respuesta unificada
      const distanciaKm = data.distance_km || 0;
      const tiempoEstimadoMinutos = data.duration_minutes || 0;
      
      // Estimar costo de combustible
      const rendimiento = opciones?.vehiculo?.rendimiento || 8; // km/litro por defecto
      const precioCombustible = 24; // MXN por litro estimado
      const costoCombustible = Math.round((distanciaKm / rendimiento) * precioCombustible);

      // Estimar peajes (muy básico)
      const peajes = Math.round(distanciaKm * 0.5); // Estimación básica

      // Calcular precisión basada en la calidad de los datos
      let precision = 85; // Base
      if (origenPreciso.precision === 'alta') precision += 5;
      if (destinoPreciso.precision === 'alta') precision += 5;
      if (origenPreciso.validadaGoogleMaps) precision += 3;
      if (destinoPreciso.validadaGoogleMaps) precision += 2;

      const rutaCalculada: RutaCalculada = {
        distanciaKm: Math.round(distanciaKm * 100) / 100,
        tiempoEstimadoMinutos: Math.round(tiempoEstimadoMinutos),
        costoCombustible,
        peajes,
        rutaOptimizada: data.google_data?.legs || [],
        precision: Math.min(precision, 100),
        origen: origenPreciso,
        destino: destinoPreciso
      };

      setRutaActual(rutaCalculada);
      
      console.log('✅ Ruta calculada exitosamente:', rutaCalculada);
      
      toast.success('Ruta calculada exitosamente', {
        description: `${distanciaKm.toFixed(1)} km • ${Math.round(tiempoEstimadoMinutos / 60)} hrs aprox • Precisión: ${precision}%`
      });

      return rutaCalculada;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error calculando ruta';
      console.error('❌ Error en cálculo de ruta:', error);
      setError(errorMessage);
      
      toast.error('Error calculando ruta', {
        description: errorMessage
      });
      
      return null;
    } finally {
      setCalculandoRuta(false);
    }
  }, [geocodificarDireccion]);

  /**
   * Validar precisión de una ubicación
   */
  const validarPrecisionUbicacion = useCallback((ubicacion: UbicacionPrecisa): {
    esConfiable: boolean;
    recomendaciones: string[];
  } => {
    const recomendaciones: string[] = [];
    let esConfiable = true;

    if (ubicacion.precision === 'baja') {
      esConfiable = false;
      recomendaciones.push('La ubicación tiene baja precisión. Considera usar una dirección más específica.');
    }

    if (!ubicacion.validadaGoogleMaps) {
      recomendaciones.push('La ubicación no ha sido validada por Google Maps.');
    }

    if (!ubicacion.codigoPostal) {
      recomendaciones.push('No se pudo determinar el código postal.');
    }

    return { esConfiable, recomendaciones };
  }, []);

  /**
   * Limpiar datos de ruta
   */
  const limpiarRuta = useCallback(() => {
    setRutaActual(null);
    setError(null);
  }, []);

  return {
    // Estado
    calculandoRuta,
    rutaActual,
    error,

    // Funciones
    geocodificarDireccion,
    calcularRutaOptimizada,
    validarPrecisionUbicacion,
    limpiarRuta,

    // Utilidades
    tieneRutaValida: !!rutaActual && rutaActual.precision > 70,
    precisenEsAlta: rutaActual?.precision && rutaActual.precision > 90
  };
};