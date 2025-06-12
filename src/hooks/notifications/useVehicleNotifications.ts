
import { useNotificationCore } from './useNotificationCore';

export const useVehicleNotifications = () => {
  const { addNotification, createContextualNotification } = useNotificationCore();

  const vehicleNotifications = {
    estadoCambiado: (placa: string, estadoAnterior: string, estadoNuevo: string) => {
      const esUrgente = estadoNuevo === 'fuera_servicio' || estadoNuevo === 'mantenimiento';
      createContextualNotification(
        esUrgente ? 'warning' : 'info',
        'Estado de Vehículo Actualizado',
        `${placa}: ${estadoAnterior} → ${estadoNuevo}`,
        esUrgente
      );
    },

    mantenimientoProgramado: (placa: string, fecha: string) => {
      addNotification({
        type: 'info',
        title: 'Mantenimiento Programado',
        message: `Vehículo ${placa} programado para ${fecha}`,
        action: {
          label: 'Ver Detalles',
          onClick: () => console.log('Navigate to vehicle details')
        }
      });
    },

    documentoVencePronto: (placa: string, documento: string, dias: number) => {
      addNotification({
        type: 'warning',
        title: 'Documento por Vencer',
        message: `${documento} del vehículo ${placa} vence en ${dias} días`,
        persistent: true,
        action: {
          label: 'Renovar',
          onClick: () => console.log('Navigate to document renewal')
        }
      });
    }
  };

  return { vehicleNotifications };
};
