
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { Truck } from 'lucide-react';

interface VehiculoSectionProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function VehiculoSection({ data, onChange }: VehiculoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="h-5 w-5" />
          <span>Vehículo Motor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Placa del Vehículo *</Label>
            <Input
              value={data.placa_vm || ''}
              onChange={(e) => onChange('placa_vm', e.target.value.toUpperCase())}
              placeholder="ABC-123-D"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Año del Modelo *</Label>
            <Input
              type="number"
              value={data.anio_modelo_vm || ''}
              onChange={(e) => onChange('anio_modelo_vm', parseInt(e.target.value) || 0)}
              placeholder="2023"
              min="1990"
              max={new Date().getFullYear() + 1}
            />
          </div>
        </div>
        
        <CatalogoSelectorMejorado
          tipo="configuraciones_vehiculares"
          label="Configuración Vehicular *"
          value={data.config_vehicular || ''}
          onValueChange={(value) => onChange('config_vehicular', value)}
          placeholder="Buscar configuración vehicular..."
          required
        />

        <div className="space-y-2">
          <Label htmlFor="peso_bruto_vehicular">Peso Bruto Vehicular (ton)</Label>
          <Input
            id="peso_bruto_vehicular"
            type="number"
            min="0"
            step="0.01"
            value={data.peso_bruto_vehicular ?? ''}
            onChange={(e) => onChange('peso_bruto_vehicular', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CatalogoSelectorMejorado
            tipo="tipos_permiso"
            label="Tipo de Permiso SCT *"
            value={data.perm_sct || ''}
            onValueChange={(value) => onChange('perm_sct', value)}
            placeholder="Buscar tipo de permiso..."
            required
          />
          
          <div className="space-y-2">
            <Label>Número de Permiso SCT *</Label>
            <Input
              value={data.num_permiso_sct || ''}
              onChange={(e) => onChange('num_permiso_sct', e.target.value)}
              placeholder="Número de permiso"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
