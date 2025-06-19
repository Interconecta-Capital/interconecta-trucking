
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AutotransporteSectionProps {
  data: any;
  onChange: (data: any) => void;
}

export function AutotransporteSection({ data, onChange }: AutotransporteSectionProps) {
  const handleFieldChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Vehículo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="placa_vm">Placa del Vehículo *</Label>
            <Input
              id="placa_vm"
              value={data?.placa_vm || ''}
              onChange={(e) => handleFieldChange('placa_vm', e.target.value)}
              placeholder="Placa del vehículo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anio_modelo_vm">Año del Modelo</Label>
            <Input
              id="anio_modelo_vm"
              type="number"
              value={data?.anio_modelo_vm || new Date().getFullYear()}
              onChange={(e) => handleFieldChange('anio_modelo_vm', parseInt(e.target.value))}
              placeholder="Año del modelo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
            <Input
              id="config_vehicular"
              value={data?.config_vehicular || ''}
              onChange={(e) => handleFieldChange('config_vehicular', e.target.value)}
              placeholder="Configuración vehicular"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos y Seguros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="perm_sct">Permiso SCT</Label>
            <Input
              id="perm_sct"
              value={data?.perm_sct || ''}
              onChange={(e) => handleFieldChange('perm_sct', e.target.value)}
              placeholder="Permiso SCT"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="num_permiso_sct">Número de Permiso SCT</Label>
            <Input
              id="num_permiso_sct"
              value={data?.num_permiso_sct || ''}
              onChange={(e) => handleFieldChange('num_permiso_sct', e.target.value)}
              placeholder="Número de permiso SCT"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asegura_resp_civil">Aseguradora Responsabilidad Civil</Label>
            <Input
              id="asegura_resp_civil"
              value={data?.asegura_resp_civil || ''}
              onChange={(e) => handleFieldChange('asegura_resp_civil', e.target.value)}
              placeholder="Aseguradora de responsabilidad civil"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="poliza_resp_civil">Póliza Responsabilidad Civil</Label>
            <Input
              id="poliza_resp_civil"
              value={data?.poliza_resp_civil || ''}
              onChange={(e) => handleFieldChange('poliza_resp_civil', e.target.value)}
              placeholder="Número de póliza"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
