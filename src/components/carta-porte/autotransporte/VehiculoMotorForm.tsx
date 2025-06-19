
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck } from 'lucide-react';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';

interface VehiculoMotorFormProps {
  data: {
    placa_vm: string;
    anio_modelo_vm: number;
    config_vehicular: string;
    peso_bruto_vehicular?: number;
  };
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export function VehiculoMotorForm({ data, onChange, errors }: VehiculoMotorFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Vehículo Motor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="placa_vm">Placa del Vehículo *</Label>
            <Input
              id="placa_vm"
              value={data.placa_vm}
              onChange={(e) => onChange('placa_vm', e.target.value.toUpperCase())}
              placeholder="Ej: ABC-1234"
              className={errors.placa_vm ? 'border-red-500' : ''}
            />
            {errors.placa_vm && <p className="text-sm text-red-500 mt-1">{errors.placa_vm}</p>}
          </div>

          <div>
            <Label htmlFor="anio_modelo_vm">Año del Modelo *</Label>
            <Input
              id="anio_modelo_vm"
              type="number"
              min="1990"
              max={new Date().getFullYear() + 1}
              value={data.anio_modelo_vm}
              onChange={(e) => onChange('anio_modelo_vm', parseInt(e.target.value))}
              className={errors.anio_modelo_vm ? 'border-red-500' : ''}
            />
            {errors.anio_modelo_vm && <p className="text-sm text-red-500 mt-1">{errors.anio_modelo_vm}</p>}
          </div>

          <CatalogoSelectorMejorado
            tipo="configuraciones_vehiculares"
            label="Configuración Vehicular"
            value={data.config_vehicular}
            onValueChange={(value) => onChange('config_vehicular', value)}
            placeholder="Selecciona configuración"
            required
            error={errors.config_vehicular}
          />

          <div>
            <Label htmlFor="peso_bruto_vehicular">Peso Bruto Vehicular (ton)</Label>
            <Input
              id="peso_bruto_vehicular"
              type="number"
              min="0"
              step="0.01"
              value={data.peso_bruto_vehicular ?? ''}
              onChange={(e) => onChange('peso_bruto_vehicular', parseFloat(e.target.value) || 0)}
              className={errors.peso_bruto_vehicular ? 'border-red-500' : ''}
            />
            {errors.peso_bruto_vehicular && (
              <p className="text-sm text-red-500 mt-1">{errors.peso_bruto_vehicular}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
