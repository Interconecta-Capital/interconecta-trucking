
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface VehiculoInsuranceProps {
  data: AutotransporteCompleto;
  onFieldChange: <K extends keyof AutotransporteCompleto>(
    field: K, 
    value: AutotransporteCompleto[K]
  ) => void;
}

export function VehiculoInsurance({ data, onFieldChange }: VehiculoInsuranceProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="asegura_resp_civil">Aseguradora Responsabilidad Civil *</Label>
          <Input 
            id="asegura_resp_civil"
            placeholder="Nombre de la aseguradora" 
            value={data.asegura_resp_civil || ''}
            onChange={(e) => onFieldChange('asegura_resp_civil', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="poliza_resp_civil">Póliza Responsabilidad Civil *</Label>
          <Input 
            id="poliza_resp_civil"
            placeholder="Número de póliza" 
            value={data.poliza_resp_civil || ''}
            onChange={(e) => onFieldChange('poliza_resp_civil', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="asegura_med_ambiente">Aseguradora Medio Ambiente</Label>
          <Input 
            id="asegura_med_ambiente"
            placeholder="Nombre de la aseguradora" 
            value={data.asegura_med_ambiente || ''}
            onChange={(e) => onFieldChange('asegura_med_ambiente', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="poliza_med_ambiente">Póliza Medio Ambiente</Label>
          <Input 
            id="poliza_med_ambiente"
            placeholder="Número de póliza" 
            value={data.poliza_med_ambiente || ''}
            onChange={(e) => onFieldChange('poliza_med_ambiente', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
