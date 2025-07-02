
import { useState, useCallback } from 'react';
import { ruteoComercialService, type ParametrosRuteoComercial, type RutaComercial, type Coordenada } from '@/services/ruteoComercial';

interface UseRuteoComercialReturn {
  calcularRutaOptima: (
    origen: Coordenada,
    destino: Coordenada,
    parametros: ParametrosRuteoComercial
  ) => Promise<RutaComercial>;
  validarRutaSegura: (
    ruta: RutaComercial,
    vehiculo: ParametrosRuteoComercial['vehiculo']
  ) => {
    esSegura: boolean;
    alertas: string[];
    recomendaciones: string[];
  };
  loading: boolean;
  error: string | null;
  limpiarCache: () => void;
  estadisticasCache: { entradas: number; ultimaActualizacion: number | null };
}

export const useRuteoComercial = (): UseRuteoComercialReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calcularRutaOptima = useCallback(async (
    origen: Coordenada,
    destino: Coordenada,
    parametros: ParametrosRuteoComercial
  ): Promise<RutaComercial> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Calculando ruta comercial optimizada:', {
        origen,
        destino,
        vehiculo: parametros.vehiculo,
        optimizacion: parametros.optimizacion
      });

      const resultado = await ruteoComercialService.calcularRutaOptima(
        origen,
        destino,
        parametros
      );

      console.log('Resultado ruteo comercial:', {
        distancia: resultado.distancia,
        tiempo: resultado.tiempo,
        restricciones: resultado.restriccionesEncontradas.length,
        advertencias: resultado.advertencias.length
      });

      return resultado;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido en ruteo comercial';
      setError(errorMsg);
      console.error('Error en useRuteoComercial:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validarRutaSegura = useCallback((
    ruta: RutaComercial,
    vehiculo: ParametrosRuteoComercial['vehiculo']
  ) => {
    return ruteoComercialService.validarRutaSegura(ruta, vehiculo);
  }, []);

  const limpiarCache = useCallback(() => {
    ruteoComercialService.limpiarCache();
  }, []);

  const estadisticasCache = ruteoComercialService.getEstadisticasCache();

  return {
    calcularRutaOptima,
    validarRutaSegura,
    loading,
    error,
    limpiarCache,
    estadisticasCache
  };
};

// Hook específico para generar múltiples opciones de ruta comercial
export const useRuteoComercialMultiple = () => {
  const { calcularRutaOptima, loading, error } = useRuteoComercial();

  const generarOpcionesRuta = useCallback(async (
    origen: Coordenada,
    destino: Coordenada,
    vehiculoBase: ParametrosRuteoComercial['vehiculo'],
    restriccionesBase: ParametrosRuteoComercial['restricciones']
  ): Promise<RutaComercial[]> => {
    const opciones: ParametrosRuteoComercial[] = [
      // Ruta más rápida
      {
        vehiculo: vehiculoBase,
        restricciones: { ...restriccionesBase, evitarPeajes: false },
        optimizacion: 'tiempo'
      },
      // Ruta más económica (evita peajes)
      {
        vehiculo: vehiculoBase,
        restricciones: { ...restriccionesBase, evitarPeajes: true },
        optimizacion: 'combustible'
      },
      // Ruta más corta
      {
        vehiculo: vehiculoBase,
        restricciones: restriccionesBase,
        optimizacion: 'distancia'
      }
    ];

    const resultados = await Promise.allSettled(
      opciones.map(opcion => calcularRutaOptima(origen, destino, opcion))
    );

    return resultados
      .filter((resultado): resultado is PromiseFulfilledResult<RutaComercial> => 
        resultado.status === 'fulfilled'
      )
      .map(resultado => resultado.value);
  }, [calcularRutaOptima]);

  return {
    generarOpcionesRuta,
    loading,
    error
  };
};
