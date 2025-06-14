
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface VehiculoBasicInfoProps {
  data: AutotransporteCompleto;
  onFieldChange: <K extends keyof AutotransporteCompleto>(
    field: K, 
    value: AutotransporteCompleto[K]
  ) => void;
  vinValidation: { valido: boolean; mensaje?: string };
  onVINChange: (vin: string) => void;
}

export function VehiculoBasicInfo({ data, onFieldChange, vinValidation, onVINChange }: VehiculoBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="placa_vm">Placa del Vehículo *</Label>
          <Input 
            id="placa_vm"
            placeholder="ABC-123-D" 
            value={data.placa_vm || ''}
            onChange={(e) => onFieldChange('placa_vm', e.target.value.toUpperCase())}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="anio_modelo_vm">Año del Modelo *</Label>
          <Input 
            id="anio_modelo_vm"
            type="number" 
            placeholder="2023"
            min="1990"
            max={new Date().getFullYear() + 1}
            value={data.anio_modelo_vm || ''}
            onChange={(e) => {
              const value = e.target.value;
              const numericValue = value === '' ? 0 : parseInt(value) || 0;
              onFieldChange('anio_modelo_vm', numericValue);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marca_vehiculo">Marca del Vehículo</Label>
          <Input 
            id="marca_vehiculo"
            placeholder="Ej: Kenworth, Freightliner, Volvo"
            value={data.marca_vehiculo || ''}
            onChange={(e) => onFieldChange('marca_vehiculo', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelo_vehiculo">Modelo del Vehículo</Label>
          <Input 
            id="modelo_vehiculo"
            placeholder="Ej: T680, Cascadia, VNL"
            value={data.modelo_vehiculo || ''}
            onChange={(e) => onFieldChange('modelo_vehiculo', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numero_serie_vin">Número de Serie VIN</Label>
        <Input 
          id="numero_serie_vin"
          placeholder="17 caracteres alfanuméricos"
          maxLength={17}
          value={data.numero_serie_vin || ''}
          onChange={(e) => onVINChange(e.target.value.toUpperCase())}
          className={!vinValidation.valido ? 'border-red-500' : ''}
        />
        {!vinValidation.valido && vinValidation.mensaje && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            {vinValidation.mensaje}
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          17 caracteres, no debe contener I, O, Q
        </div>
      </div>
    </div>
  );
}
