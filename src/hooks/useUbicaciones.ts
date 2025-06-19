
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
    console.log('➕ Hook: Agregando ubicación:', ubicacion);
    setUbicaciones(prev => {
      const nuevasUbicaciones = [...prev, ubicacion];
      console.log('✅ Hook: Ubicaciones después de agregar:', nuevasUbicaciones);
      return nuevasUbicaciones;
    });
  }, []);

  const actualizarUbicacion = useCallback((index: number, ubicacion: Ubicacion) => {
    console.log('✏️ Hook: Actualizando ubicación en índice:', index, ubicacion);
    setUbicaciones(prev => {
      const nuevasUbicaciones = prev.map((u, i) => i === index ? ubicacion : u);
      console.log('✅ Hook: Ubicaciones después de actualizar:', nuevasUbicaciones);
      return nuevasUbicaciones;
    });
  }, []);

  const eliminarUbicacion = useCallback((index: number) => {
    console.log('🗑️ Hook: Eliminando ubicación en índice:', index);
    setUbicaciones(prev => {
      const nuevasUbicaciones = prev.filter((_, i) => i !== index);
      console.log('✅ Hook: Ubicaciones después de eliminar:', nuevasUbicaciones);
      return nuevasUbicaciones;
    });
  }, []);

  const reordenarUbicaciones = useCallback((startIndex: number, endIndex: number) => {
    console.log('🔄 Hook: Reordenando ubicaciones:', startIndex, '->', endIndex);
    setUbicaciones(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Actualizar orden de secuencia
      const nuevasUbicaciones = result.map((ubicacion, index) => ({
        ...ubicacion,
        ordenSecuencia: index + 1
      }));
      
      console.log('✅ Hook: Ubicaciones después de reordenar:', nuevasUbicaciones);
      return nuevasUbicaciones;
    });
  }, []);

  const calcularDistanciasAutomaticas = useCallback(async () => {
    console.log('📏 Hook: Iniciando cálculo automático de distancias');
    const ubicacionesActualizadas = await calcularDistanciasAutomaticasBase(ubicaciones);
    setUbicaciones(ubicacionesActualizadas);
    console.log('✅ Hook: Distancias calculadas:', ubicacionesActualizadas);
  }, [ubicaciones, calcularDistanciasAutomaticasBase]);

  const calcularRutaCompleta = useCallback(async () => {
    console.log('🗺️ Hook: Iniciando cálculo de ruta completa');
    const ruta = await calcularRutaCompletaBase(ubicaciones);
    setRutaCalculada(ruta);
    console.log('✅ Hook: Ruta calculada:', ruta);
  }, [ubicaciones, calcularRutaCompletaBase]);

  const calcularDistanciaTotalCallback = useCallback(() => {
    const distancia = calcularDistanciaTotal(ubicaciones);
    console.log('📊 Hook: Distancia total calculada:', distancia);
    return distancia;
  }, [ubicaciones]);

  const validarSecuenciaUbicacionesCallback = useCallback(() => {
    const validacion = validarSecuenciaUbicaciones(ubicaciones);
    console.log('✅ Hook: Validación de secuencia:', validacion);
    return validacion;
  }, [ubicaciones]);

  const generarIdUbicacionCallback = useCallback((tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => {
    const id = generarIdUbicacion(tipo, ubicaciones);
    console.log('🆔 Hook: ID generado para', tipo, ':', id);
    return id;
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
    calcularDistanciaTotal: calcularDistanciaTotalCallback,
    validarSecuenciaUbicaciones: validarSecuenciaUbicacionesCallback,
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
