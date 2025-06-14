
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface VehiculoSpecificationsProps {
  data: AutotransporteCompleto;
  onFieldChange: <K extends keyof AutotransporteCompleto>(
    field: K, 
    value: AutotransporteCompleto[K]
  ) => void;
}

export function VehiculoSpecifications({ data, onFieldChange }: VehiculoSpecificationsProps) {
  return (
    <div className="space-y-4">
      <CatalogoSelectorMejorado
        tipo="configuraciones_vehiculares"
        label="Configuración Vehicular"
        value={data.config_vehicular || ''}
        onValueChange={(value) => onFieldChange('config_vehicular', value)}
        placeholder="Buscar configuración vehicular..."
        required
      />

      <div className="space-y-2">
        <Label htmlFor="tipo_carroceria">Tipo de Carrocería</Label>
        <Input 
          id="tipo_carroceria"
          placeholder="Ej: Caja seca, Refrigerado, Tanque"
          value={data.tipo_carroceria || ''}
          onChange={(e) => onFieldChange('tipo_carroceria', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacidad_carga">Capacidad de Carga (kg)</Label>
          <Input 
            id="capacidad_carga"
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={data.capacidad_carga || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              onFieldChange('capacidad_carga', value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="peso_bruto_vehicular">Peso Bruto Vehicular (kg)</Label>
          <Input 
            id="peso_bruto_vehicular"
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={data.peso_bruto_vehicular || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              onFieldChange('peso_bruto_vehicular', value);
            }}
          />
        </div>
      </div>
    </div>
  );
}
