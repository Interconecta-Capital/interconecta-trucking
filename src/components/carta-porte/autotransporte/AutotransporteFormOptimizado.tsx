
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RemolquesForm } from './RemolquesForm';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface AutotransporteFormOptimizadoProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
}

export function AutotransporteFormOptimizado({ data, onChange }: AutotransporteFormOptimizadoProps) {
  const handleFieldChange = <K extends keyof AutotransporteCompleto>(field: K, value: AutotransporteCompleto[K]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Vehículo Motor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="placa_vm">Placa del Vehículo *</Label>
              <Input
                id="placa_vm"
                value={data.placa_vm || ''}
                onChange={(e) => handleFieldChange('placa_vm', e.target.value.toUpperCase())}
                placeholder="Ej: ABC-1234"
              />
            </div>

            <div>
              <Label htmlFor="anio_modelo_vm">Año del Modelo *</Label>
              <Input
                id="anio_modelo_vm"
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={data.anio_modelo_vm || ''}
                onChange={(e) => handleFieldChange('anio_modelo_vm', Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
              <Input
                id="config_vehicular"
                value={data.config_vehicular || ''}
                onChange={(e) => handleFieldChange('config_vehicular', e.target.value)}
                placeholder="Ej: T2S1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos SCT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="perm_sct">Tipo de Permiso SCT</Label>
              <Input
                id="perm_sct"
                value={data.perm_sct || ''}
                onChange={(e) => handleFieldChange('perm_sct', e.target.value)}
                placeholder="Ej: Permiso de Autotransporte Federal"
              />
            </div>

            <div>
              <Label htmlFor="num_permiso_sct">Número de Permiso SCT *</Label>
              <Input
                id="num_permiso_sct"
                value={data.num_permiso_sct || ''}
                onChange={(e) => handleFieldChange('num_permiso_sct', e.target.value)}
                placeholder="Número de permiso"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="asegura_resp_civil">Aseguradora Responsabilidad Civil *</Label>
              <Input
                id="asegura_resp_civil"
                value={data.asegura_resp_civil || ''}
                onChange={(e) => handleFieldChange('asegura_resp_civil', e.target.value)}
                placeholder="Nombre de la aseguradora"
              />
            </div>

            <div>
              <Label htmlFor="poliza_resp_civil">Póliza Responsabilidad Civil *</Label>
              <Input
                id="poliza_resp_civil"
                value={data.poliza_resp_civil || ''}
                onChange={(e) => handleFieldChange('poliza_resp_civil', e.target.value)}
                placeholder="Número de póliza"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="asegura_med_ambiente">Aseguradora Medio Ambiente</Label>
              <Input
                id="asegura_med_ambiente"
                value={data.asegura_med_ambiente || ''}
                onChange={(e) => handleFieldChange('asegura_med_ambiente', e.target.value)}
                placeholder="Nombre de la aseguradora"
              />
            </div>

            <div>
              <Label htmlFor="poliza_med_ambiente">Póliza Medio Ambiente</Label>
              <Input
                id="poliza_med_ambiente"
                value={data.poliza_med_ambiente || ''}
                onChange={(e) => handleFieldChange('poliza_med_ambiente', e.target.value)}
                placeholder="Número de póliza"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <RemolquesForm
        remolques={data.remolques || []}
        onChange={(remolques) => handleFieldChange('remolques', remolques)}
      />
    </div>
  );
}
