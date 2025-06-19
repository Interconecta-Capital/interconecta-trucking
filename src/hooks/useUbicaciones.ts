
import { useState, useCallback, useRef } from 'react';
import { Ubicacion } from '@/types/ubicaciones';
import { useUbicacionesFrecuentes } from './useUbicacionesFrecuentes';
import { useUbicacionesGeocodificacion } from './useUbicacionesGeocodificacion';
import { calcularDistanciaTotal, validarSecuenciaUbicaciones, generarIdUbicacion } from '@/utils/ubicacionesHelpers';

export const useUbicaciones = (cartaPorteId?: string) => {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [rutaCalculada, setRutaCalculada] = useState<any>(null);
  
  // Referencias para evitar loops y mejorar estabilidad
  const lastUpdateRef = useRef<string>('');
  const operationInProgressRef = useRef(false);

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

  // SOLUCIÓN 1: setUbicaciones estable que evita loops
  const setUbicacionesEstable = useCallback((nuevasUbicaciones: Ubicacion[] | ((prev: Ubicacion[]) => Ubicacion[])) => {
    console.log('🔄 Hook: setUbicacionesEstable llamado');
    
    // Prevenir operaciones concurrentes
    if (operationInProgressRef.current) {
      console.log('⚠️ Hook: Operación en progreso, ignorando update');
      return;
    }
    
    operationInProgressRef.current = true;
    
    setUbicaciones(prev => {
      const newValue = typeof nuevasUbicaciones === 'function' 
        ? nuevasUbicaciones(prev) 
        : nuevasUbicaciones;
      
      // Crear signature para evitar updates innecesarios
      const newSignature = JSON.stringify(newValue.map(u => ({
        id: u.idUbicacion,
        tipo: u.tipoUbicacion,
        cp: u.domicilio?.codigoPostal
      })));
      
      // Solo actualizar si realmente hay cambios
      if (lastUpdateRef.current !== newSignature) {
        lastUpdateRef.current = newSignature;
        console.log('✅ Hook: Ubicaciones actualizadas:', newValue.length);
        
        // Liberar flag después de un tick
        setTimeout(() => {
          operationInProgressRef.current = false;
        }, 0);
        
        return newValue;
      } else {
        console.log('📌 Hook: Sin cambios reales, manteniendo estado anterior');
        operationInProgressRef.current = false;
        return prev;
      }
    });
  }, []);

  const agregarUbicacion = useCallback((ubicacion: Ubicacion) => {
    console.log('➕ Hook: Agregando ubicación:', ubicacion);
    setUbicacionesEstable(prev => {
      const nuevasUbicaciones = [...prev, ubicacion];
      console.log('✅ Hook: Ubicaciones después de agregar:', nuevasUbicaciones.length);
      return nuevasUbicaciones;
    });
  }, [setUbicacionesEstable]);

  const actualizarUbicacion = useCallback((index: number, ubicacion: Ubicacion) => {
    console.log('✏️ Hook: Actualizando ubicación en índice:', index);
    setUbicacionesEstable(prev => {
      if (index < 0 || index >= prev.length) {
        console.warn('⚠️ Hook: Índice fuera de rango:', index);
        return prev;
      }
      
      const nuevasUbicaciones = prev.map((u, i) => i === index ? ubicacion : u);
      console.log('✅ Hook: Ubicación actualizada exitosamente');
      return nuevasUbicaciones;
    });
  }, [setUbicacionesEstable]);

  const eliminarUbicacion = useCallback((index: number) => {
    console.log('🗑️ Hook: Eliminando ubicación en índice:', index);
    setUbicacionesEstable(prev => {
      if (index < 0 || index >= prev.length) {
        console.warn('⚠️ Hook: Índice fuera de rango:', index);
        return prev;
      }
      
      const nuevasUbicaciones = prev.filter((_, i) => i !== index);
      console.log('✅ Hook: Ubicación eliminada, total:', nuevasUbicaciones.length);
      return nuevasUbicaciones;
    });
  }, [setUbicacionesEstable]);

  const reordenarUbicaciones = useCallback((startIndex: number, endIndex: number) => {
    console.log('🔄 Hook: Reordenando ubicaciones:', startIndex, '->', endIndex);
    setUbicacionesEstable(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Actualizar orden de secuencia
      const nuevasUbicaciones = result.map((ubicacion, index) => ({
        ...ubicacion,
        ordenSecuencia: index + 1
      }));
      
      console.log('✅ Hook: Ubicaciones reordenadas exitosamente');
      return nuevasUbicaciones;
    });
  }, [setUbicacionesEstable]);

  const calcularDistanciasAutomaticas = useCallback(async () => {
    console.log('📏 Hook: Iniciando cálculo automático de distancias');
    try {
      const ubicacionesActualizadas = await calcularDistanciasAutomaticasBase(ubicaciones);
      setUbicacionesEstable(ubicacionesActualizadas);
      console.log('✅ Hook: Distancias calculadas y aplicadas');
    } catch (error) {
      console.error('❌ Hook: Error calculando distancias:', error);
      throw error;
    }
  }, [ubicaciones, calcularDistanciasAutomaticasBase, setUbicacionesEstable]);

  const calcularRutaCompleta = useCallback(async () => {
    console.log('🗺️ Hook: Iniciando cálculo de ruta completa');
    try {
      const ruta = await calcularRutaCompletaBase(ubicaciones);
      setRutaCalculada(ruta);
      console.log('✅ Hook: Ruta calculada exitosamente');
    } catch (error) {
      console.error('❌ Hook: Error calculando ruta:', error);
      throw error;
    }
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
    setUbicaciones: setUbicacionesEstable,
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
