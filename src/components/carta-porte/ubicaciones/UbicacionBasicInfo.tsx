
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ubicacion } from '@/hooks/useUbicaciones';

interface UbicacionBasicInfoProps {
  formData: Ubicacion;
  onTipoChange: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => void;
  onFechaChange: (fecha: string) => void;
}

export function UbicacionBasicInfo({ 
  formData, 
  onTipoChange, 
  onFechaChange 
}: UbicacionBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Tipo de Ubicación *</Label>
        <Select 
          value={formData.tipoUbicacion || ''} 
          onValueChange={(value) => {
            if (value) {
              onTipoChange(value as 'Origen' | 'Destino' | 'Paso Intermedio');
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Origen">Origen</SelectItem>
            <SelectItem value="Destino">Destino</SelectItem>
            <SelectItem value="Paso Intermedio">Paso Intermedio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>ID Ubicación</Label>
        <Input
          value={formData.idUbicacion || ''}
          disabled
          className="bg-gray-50"
          placeholder="Se genera automáticamente al seleccionar tipo"
        />
      </div>

      <div className="space-y-2">
        <Label>Fecha y Hora</Label>
        <Input
          type="datetime-local"
          value={formData.fechaHoraSalidaLlegada || ''}
          onChange={(e) => onFechaChange(e.target.value)}
        />
      </div>
    </div>
  );
}
