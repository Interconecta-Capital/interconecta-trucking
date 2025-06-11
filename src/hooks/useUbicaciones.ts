
import { useState, useCallback } from 'react';
import { Ubicacion } from '@/types/ubicaciones';
import { useUbicacionesFrecuentes } from './useUbicacionesFrecuentes';
import { useUbicacionesGeocodificacion } from './useUbicacionesGeocodificacion';
import { calcularDistanciaTotal, validarSecuenciaUbicaciones, generarIdUbicacion } from '@/utils/ubicacionesHelpers';

export const useUbicaciones = (cartaPorteId?: string) => {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [rutaCalculada, setRutaCalculada] = useState<any>(null);

  const {
    ubicacionesFrecuentes,
    loadingFrecuentes,
    guardarUbicacionFrecuente,
    isGuardando
  } = useUbicacionesFrecuentes();

  const {
    geocodificarUbicacion,
    calcularDistanciasAutomaticas: calcularDistanciasAutomaticasBase,
    calcularRutaCompleta: calcularRutaCompletaBase
  } = useUbicacionesGeocodificacion();

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

  const calcularDistanciasAutomaticas = useCallback(async () => {
    const ubicacionesActualizadas = await calcularDistanciasAutomaticasBase(ubicaciones);
    setUbicaciones(ubicacionesActualizadas);
  }, [ubicaciones, calcularDistanciasAutomaticasBase]);

  const calcularRutaCompleta = useCallback(async () => {
    const ruta = await calcularRutaCompletaBase(ubicaciones);
    setRutaCalculada(ruta);
  }, [ubicaciones, calcularRutaCompletaBase]);

  const calcularDistanciaTotal = useCallback(() => {
    return calcularDistanciaTotal(ubicaciones);
  }, [ubicaciones]);

  const validarSecuenciaUbicaciones = useCallback(() => {
    return validarSecuenciaUbicaciones(ubicaciones);
  }, [ubicaciones]);

  const generarIdUbicacionCallback = useCallback((tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => {
    return generarIdUbicacion(tipo, ubicaciones);
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
    generarIdUbicacion: generarIdUbicacionCallback,
    guardarUbicacionFrecuente,
    isGuardando,
    geocodificarUbicacion,
    calcularDistanciasAutomaticas,
    calcularRutaCompleta,
  };
};

// Export types for backward compatibility
export type { Ubicacion, UbicacionFrecuente } from '@/types/ubicaciones';
