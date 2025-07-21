
import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Ubicacion } from '@/types/ubicaciones';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface FechaHoraFieldsProps {
  ubicacion: Partial<Ubicacion>;
  onFieldChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
  ubicacionIndex?: number;
  totalUbicaciones?: number;
}

export function FechaHoraFields({
  ubicacion,
  onFieldChange,
  errors = {},
  ubicacionIndex = 0,
  totalUbicaciones = 1
}: FechaHoraFieldsProps) {
  const isOrigen = ubicacion.tipoUbicacion === 'Origen';
  const isDestino = ubicacion.tipoUbicacion === 'Destino';
  const isPasoIntermedio = ubicacion.tipoUbicacion === 'Paso Intermedio';

  const getFieldLabel = () => {
    if (isOrigen) return 'Fecha y Hora de Salida';
    if (isDestino) return 'Fecha y Hora de Llegada';
    return 'Fecha y Hora Estimada de Paso';
  };

  const getFieldPlaceholder = () => {
    if (isOrigen) return 'Cuando saldrá de este punto';
    if (isDestino) return 'Cuando llegará a este punto';
    return 'Cuando pasará por este punto';
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onFieldChange('fechaHoraSalidaLlegada', date.toISOString());
    }
  };

  const currentDate = ubicacion.fechaHoraSalidaLlegada ? new Date(ubicacion.fechaHoraSalidaLlegada) : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {isOrigen && <Calendar className="h-4 w-4 text-green-600" />}
          {isDestino && <Clock className="h-4 w-4 text-red-600" />}
          {isPasoIntermedio && <Clock className="h-4 w-4 text-blue-600" />}
        </div>
      </div>

      <DateTimePicker
        label={getFieldLabel() + ((isOrigen || isDestino) ? ' *' : '')}
        date={currentDate}
        onDateChange={handleDateChange}
        placeholder={getFieldPlaceholder()}
        required={isOrigen || isDestino}
        minDate={new Date()}
        className={
          isOrigen ? 'border-green-200 focus:border-green-500' :
          isDestino ? 'border-red-200 focus:border-red-500' :
          'border-blue-200 focus:border-blue-500'
        }
      />

      {errors.fechaHora && (
        <p className="text-sm text-red-500">{errors.fechaHora}</p>
      )}

      {/* Información adicional según el tipo */}
      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
        {isOrigen && (
          <span className="text-green-700">
            ⏰ Fecha de salida del punto de origen (requerida por SAT)
          </span>
        )}
        {isDestino && (
          <span className="text-red-700">
            🏁 Fecha estimada de llegada al destino final (requerida por SAT)
          </span>
        )}
        {isPasoIntermedio && (
          <span className="text-blue-700">
            📍 Fecha estimada de paso por este punto (opcional pero recomendado)
          </span>
        )}
      </div>
    </div>
  );
}
