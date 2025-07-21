
import React from 'react';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface UbicacionDateTimeFieldProps {
  tipoUbicacion: string;
  fechaHoraSalidaLlegada: string;
  onFechaHoraChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UbicacionDateTimeField({
  tipoUbicacion,
  fechaHoraSalidaLlegada,
  onFechaHoraChange
}: UbicacionDateTimeFieldProps) {
  if (tipoUbicacion !== 'Origen' && tipoUbicacion !== 'Destino') {
    return null;
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Crear un evento sintético para mantener compatibilidad
      const event = {
        target: {
          value: date.toISOString().slice(0, 16) // formato datetime-local
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onFechaHoraChange(event);
    }
  };

  const currentDate = fechaHoraSalidaLlegada ? new Date(fechaHoraSalidaLlegada) : undefined;

  return (
    <DateTimePicker
      label={`Fecha y Hora de ${tipoUbicacion === 'Origen' ? 'Salida' : 'Llegada'}`}
      date={currentDate}
      onDateChange={handleDateChange}
      placeholder={`Selecciona fecha de ${tipoUbicacion === 'Origen' ? 'salida' : 'llegada'}`}
      required
      minDate={new Date()}
    />
  );
}
