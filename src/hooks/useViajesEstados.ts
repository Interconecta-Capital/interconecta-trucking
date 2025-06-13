
import { useState, useCallback } from 'react';
import { useViajesData } from './viajes/useViajesData';
import { useViajesMutations } from './viajes/useViajesMutations';
import { useViajeActions } from './viajes/useViajeActions';

interface UseViajesEstadosError {
  type: 'data' | 'mutation' | 'action';
  message: string;
  details?: any;
}

export const useViajesEstados = () => {
  const [globalError, setGlobalError] = useState<UseViajesEstadosError | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  const logDebug = useCallback((message: string, data?: any) => {
    if (debugMode) {
      console.log(`[ViajesEstados] ${message}`, data);
    }
  }, [debugMode]);

  const handleError = useCallback((type: UseViajesEstadosError['type'], error: any, context: string) => {
    const errorMessage = error?.message || 'Error desconocido';
    console.error(`[ViajesEstados ${type}] ${context}:`, error);
    
    setGlobalError({
      type,
      message: errorMessage,
      details: error
    });
  }, []);

  // Hook de datos con manejo de errores
  const dataHook = (() => {
    try {
      logDebug('Initializing useViajesData hook');
      return useViajesData();
    } catch (error) {
      handleError('data', error, 'useViajesData initialization');
      return {
        viajesActivos: [],
        isLoading: false,
        obtenerEventosViaje: async () => []
      };
    }
  })();

  // Hook de mutaciones con manejo de errores
  const mutationsHook = (() => {
    try {
      logDebug('Initializing useViajesMutations hook');
      return useViajesMutations();
    } catch (error) {
      handleError('mutation', error, 'useViajesMutations initialization');
      return {
        isLoading: false,
        cambiarEstadoViaje: () => {
          console.error('ViajesMutations not available due to initialization error');
        },
        registrarEventoViaje: async () => {
          console.error('ViajesMutations not available due to initialization error');
        }
      };
    }
  })();

  // Hook de acciones con manejo de errores
  const actionsHook = (() => {
    try {
      logDebug('Initializing useViajeActions hook');
      return useViajeActions();
    } catch (error) {
      handleError('action', error, 'useViajeActions initialization');
      return {
        iniciarViaje: async () => {
          console.error('ViajeActions not available due to initialization error');
        },
        completarViaje: async () => {
          console.error('ViajeActions not available due to initialization error');
        },
        reportarRetraso: async () => {
          console.error('ViajeActions not available due to initialization error');
        },
        actualizarUbicacion: async () => {
          console.error('ViajeActions not available due to initialization error');
        }
      };
    }
  })();

  // Funciones wrapper con logging y manejo de errores
  const obtenerEventosViajeSafe = useCallback(async (viajeId: string) => {
    try {
      logDebug('Getting eventos for viaje', { viajeId });
      const eventos = await dataHook.obtenerEventosViaje(viajeId);
      logDebug('Successfully retrieved eventos', { count: eventos.length });
      return eventos;
    } catch (error) {
      handleError('data', error, `obtenerEventosViaje for ${viajeId}`);
      return [];
    }
  }, [dataHook.obtenerEventosViaje, logDebug, handleError]);

  const cambiarEstadoViajeSafe = useCallback((params: any) => {
    try {
      logDebug('Changing viaje state', params);
      mutationsHook.cambiarEstadoViaje(params);
    } catch (error) {
      handleError('mutation', error, 'cambiarEstadoViaje');
    }
  }, [mutationsHook.cambiarEstadoViaje, logDebug, handleError]);

  const registrarEventoViajeSafe = useCallback(async (params: any) => {
    try {
      logDebug('Registering viaje event', params);
      await mutationsHook.registrarEventoViaje(params);
      logDebug('Successfully registered event');
    } catch (error) {
      handleError('mutation', error, 'registrarEventoViaje');
    }
  }, [mutationsHook.registrarEventoViaje, logDebug, handleError]);

  const iniciarViajeSafe = useCallback(async (viajeId: string, ubicacionActual?: string) => {
    try {
      logDebug('Starting viaje', { viajeId, ubicacionActual });
      await actionsHook.iniciarViaje(viajeId, ubicacionActual);
      logDebug('Successfully started viaje');
    } catch (error) {
      handleError('action', error, `iniciarViaje for ${viajeId}`);
    }
  }, [actionsHook.iniciarViaje, logDebug, handleError]);

  const completarViajeSafe = useCallback(async (viajeId: string, observaciones?: string) => {
    try {
      logDebug('Completing viaje', { viajeId, observaciones });
      await actionsHook.completarViaje(viajeId, observaciones);
      logDebug('Successfully completed viaje');
    } catch (error) {
      handleError('action', error, `completarViaje for ${viajeId}`);
    }
  }, [actionsHook.completarViaje, logDebug, handleError]);

  const reportarRetrasoSafe = useCallback(async (viajeId: string, motivo: string, tiempoEstimado?: number) => {
    try {
      logDebug('Reporting delay', { viajeId, motivo, tiempoEstimado });
      await actionsHook.reportarRetraso(viajeId, motivo, tiempoEstimado);
      logDebug('Successfully reported delay');
    } catch (error) {
      handleError('action', error, `reportarRetraso for ${viajeId}`);
    }
  }, [actionsHook.reportarRetraso, logDebug, handleError]);

  const actualizarUbicacionSafe = useCallback(async (viajeId: string, coordenadas: { lat: number; lng: number }, direccion?: string) => {
    try {
      logDebug('Updating location', { viajeId, coordenadas, direccion });
      await actionsHook.actualizarUbicacion(viajeId, coordenadas, direccion);
      logDebug('Successfully updated location');
    } catch (error) {
      handleError('action', error, `actualizarUbicacion for ${viajeId}`);
    }
  }, [actionsHook.actualizarUbicacion, logDebug, handleError]);

  const clearError = useCallback(() => {
    setGlobalError(null);
  }, []);

  const enableDebugMode = useCallback(() => {
    setDebugMode(true);
    console.log('[ViajesEstados] Debug mode enabled');
  }, []);

  const disableDebugMode = useCallback(() => {
    setDebugMode(false);
    console.log('[ViajesEstados] Debug mode disabled');
  }, []);

  // Calcular estado general de loading
  const isLoading = dataHook.isLoading || mutationsHook.isLoading;

  logDebug('Hook state', {
    viajesActivosCount: dataHook.viajesActivos?.length || 0,
    isLoading,
    hasError: !!globalError,
    debugMode
  });

  return {
    // Datos
    viajesActivos: dataHook.viajesActivos || [],
    isLoading,
    
    // Funciones principales
    obtenerEventosViaje: obtenerEventosViajeSafe,
    cambiarEstadoViaje: cambiarEstadoViajeSafe,
    registrarEventoViaje: registrarEventoViajeSafe,
    iniciarViaje: iniciarViajeSafe,
    completarViaje: completarViajeSafe,
    reportarRetraso: reportarRetrasoSafe,
    actualizarUbicacion: actualizarUbicacionSafe,
    
    // Manejo de errores y debugging
    error: globalError,
    clearError,
    debugMode,
    enableDebugMode,
    disableDebugMode
  };
};

// Re-export types for convenience
export type { Viaje, EventoViaje } from './viajes/types';
