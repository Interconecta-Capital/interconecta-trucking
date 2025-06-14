
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface VehiculoDimensionsProps {
  data: AutotransporteCompleto;
  onDimensionesChange: (dimension: 'largo' | 'ancho' | 'alto', value: number) => void;
}

export function VehiculoDimensions({ data, onDimensionesChange }: VehiculoDimensionsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dimension_largo">Largo (m)</Label>
          <Input 
            id="dimension_largo"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={data.dimensiones?.largo || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              onDimensionesChange('largo', value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dimension_ancho">Ancho (m)</Label>
          <Input 
            id="dimension_ancho"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={data.dimensiones?.ancho || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              onDimensionesChange('ancho', value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dimension_alto">Alto (m)</Label>
          <Input 
            id="dimension_alto"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={data.dimensiones?.alto || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              onDimensionesChange('alto', value);
            }}
          />
        </div>
      </div>
    </div>
  );
}
