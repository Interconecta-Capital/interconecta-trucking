
import { useViajesData } from './viajes/useViajesData';
import { useViajesMutations } from './viajes/useViajesMutations';
import { useViajeActions } from './viajes/useViajeActions';

export const useViajesEstados = () => {
  const { viajesActivos, isLoading: loadingViajes, obtenerEventosViaje } = useViajesData();
  const { isLoading: mutationLoading, cambiarEstadoViaje, registrarEventoViaje } = useViajesMutations();
  const { iniciarViaje, completarViaje, reportarRetraso, actualizarUbicacion } = useViajeActions();

  return {
    viajesActivos,
    isLoading: loadingViajes || mutationLoading,
    obtenerEventosViaje,
    cambiarEstadoViaje,
    registrarEventoViaje,
    iniciarViaje,
    completarViaje,
    reportarRetraso,
    actualizarUbicacion
  };
};

// Re-export types for convenience
export type { Viaje, EventoViaje } from './viajes/types';
