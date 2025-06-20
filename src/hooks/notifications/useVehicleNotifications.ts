
import { useCallback } from 'react';
import { useNotifications } from '../useNotifications';

export const useVehicleNotifications = () => {
  const { showWarning, showError, showSuccess } = useNotifications();

  const vehicleNotifications = {
    documentoVencePronto: (placa: string, tipoDocumento: string, dias: number) => {
      showWarning({
        title: 'Documento por vencer',
        description: `${tipoDocumento} del vehículo ${placa} vence en ${dias} día${dias !== 1 ? 's' : ''}`,
        duration: 8000
      });
    },

    documentoVencido: (placa: string, tipoDocumento: string) => {
      showError({
        title: 'Documento vencido',
        description: `${tipoDocumento} del vehículo ${placa} ha vencido`,
        duration: 10000
      });
    },

    mantenimientoProgramado: (placa: string, tipo: string, fecha: string) => {
      showWarning({
        title: 'Mantenimiento programado',
        description: `${tipo} para vehículo ${placa} programado el ${fecha}`,
        duration: 6000
      });
    },

    estadoCambiado: (placa: string, estadoAnterior: string, estadoNuevo: string) => {
      showSuccess({
        title: 'Estado actualizado',
        description: `Vehículo ${placa} cambió de ${estadoAnterior} a ${estadoNuevo}`,
        duration: 4000
      });
    }
  };

  return { vehicleNotifications };
};
