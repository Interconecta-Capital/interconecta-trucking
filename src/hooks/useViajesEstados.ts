
import { useViajesData } from './viajes/useViajesData';
import { useViajesMutations } from './viajes/useViajesMutations';
import { useViajeActions } from './viajes/useViajeActions';
import { useViajesErrors } from './viajes/useViajesErrors';
import { useViajesDebug } from './viajes/useViajesDebug';

export const useViajesEstados = () => {
  const debugHook = useViajesDebug();
  const { error, handleError, clearError } = useViajesErrors();

  debugHook.logInfo('ViajesEstados', 'Hook initialized');

  // Hook de datos
  const dataHook = useViajesData();
  
  // Hook de mutaciones
  const mutationsHook = useViajesMutations();
  
  // Hook de acciones
  const actionsHook = useViajeActions();

  // Verificar si hay errores en los hooks
  if (dataHook.error) {
    debugHook.logError('ViajesEstados', 'Data hook error detected', dataHook.error);
    handleError('data', dataHook.error, 'useViajesData');
  }

  // Calcular estado general de loading
  const isLoading = dataHook.isLoading || mutationsHook.isLoading;

  debugHook.logInfo('ViajesEstados', 'Hook state', {
    viajesActivosCount: dataHook.viajesActivos?.length || 0,
    isLoading,
    hasError: !!error,
    debugMode: debugHook.debugMode
  });

  return {
    // Datos
    viajesActivos: dataHook.viajesActivos || [],
    isLoading,
    
    // Funciones principales
    obtenerEventosViaje: dataHook.obtenerEventosViaje,
    cambiarEstadoViaje: mutationsHook.cambiarEstadoViaje,
    registrarEventoViaje: mutationsHook.registrarEventoViaje,
    iniciarViaje: actionsHook.iniciarViaje,
    completarViaje: actionsHook.completarViaje,
    reportarRetraso: actionsHook.reportarRetraso,
    actualizarUbicacion: actionsHook.actualizarUbicacion,
    
    // Agregar funciones faltantes para el editor
    actualizarViaje: mutationsHook.actualizarViaje,
    isUpdatingViaje: mutationsHook.isUpdatingViaje,
    
    // Manejo de errores y debugging - exportar todas las funciones
    error,
    clearError,
    debugMode: debugHook.debugMode,
    logDebug: debugHook.logDebug,
    logInfo: debugHook.logInfo,
    logError: debugHook.logError,
    enableDebugMode: debugHook.enableDebugMode,
    disableDebugMode: debugHook.disableDebugMode
  };
};

// Re-export types for convenience
export type { Viaje, EventoViaje } from './viajes/types';
