
import { useCallback } from 'react';
import { useNotifications } from '../useNotifications';

export const useTripNotifications = () => {
  const { showSuccess, showWarning, showInfo } = useNotifications();

  const tripNotifications = {
    viajeIniciado: (origen: string, destino: string) => {
      showSuccess({
        title: 'Viaje iniciado',
        description: `Ruta: ${origen} → ${destino}`,
        duration: 5000
      });
    },

    viajeCompletado: (origen: string, destino: string) => {
      showSuccess({
        title: 'Viaje completado',
        description: `Ruta completada: ${origen} → ${destino}`,
        duration: 6000
      });
    },

    retrasoDetectado: (retrasoMinutos: number) => {
      showWarning({
        title: 'Retraso detectado',
        description: `El viaje presenta un retraso de ${retrasoMinutos} minutos`,
        duration: 8000
      });
    },

    cartaPorteGenerada: (folio: string) => {
      showInfo({
        title: 'Carta Porte generada',
        description: `Carta Porte ${folio} creada exitosamente`,
        duration: 4000
      });
    }
  };

  return { tripNotifications };
};
