
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

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

  return (
    <div>
      <Label htmlFor="fechaHora" className="flex items-center gap-2 text-gray-700 font-medium">
        <Calendar className="h-4 w-4" />
        Fecha y Hora de {tipoUbicacion === 'Origen' ? 'Salida' : 'Llegada'}
      </Label>
      <Input
        id="fechaHora"
        type="datetime-local"
        value={fechaHoraSalidaLlegada}
        onChange={onFechaHoraChange}
        className="border-gray-100 bg-white text-gray-900 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm"
      />
    </div>
  );
}
