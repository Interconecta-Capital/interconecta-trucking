
import { useNotificationCore } from './useNotificationCore';

export const useTripNotifications = () => {
  const { addNotification, createContextualNotification } = useNotificationCore();

  const tripNotifications = {
    viajeIniciado: (origen: string, destino: string) => {
      createContextualNotification(
        'success',
        'Viaje Iniciado',
        `Ruta: ${origen} → ${destino}`
      );
    },

    viajeCompletado: (origen: string, destino: string) => {
      createContextualNotification(
        'success',
        'Viaje Completado',
        `Entrega exitosa en ${destino}`
      );
    },

    retrasoDetectado: (retrasoMinutos: number, ubicacionActual: string) => {
      addNotification({
        type: 'warning',
        title: 'Retraso Detectado',
        message: `${retrasoMinutos} min de retraso en ${ubicacionActual}`,
        persistent: true,
        action: {
          label: 'Ver Tracking',
          onClick: () => console.log('Navigate to tracking')
        }
      });
    },

    emergencia: (ubicacion: string, descripcion: string) => {
      addNotification({
        type: 'error',
        title: 'EMERGENCIA',
        message: `${descripcion} en ${ubicacion}`,
        persistent: true,
        action: {
          label: 'Atender',
          onClick: () => console.log('Handle emergency')
        }
      });
    }
  };

  return { tripNotifications };
};
