
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AutotransporteCompleto } from '@/types/cartaPorte';
import { Truck } from 'lucide-react';

interface AutotransporteSectionProps {
  autotransporte: AutotransporteCompleto;
  onChange: (autotransporte: AutotransporteCompleto) => void;
}

export function AutotransporteSection({ autotransporte, onChange }: AutotransporteSectionProps) {
  const updateField = (field: keyof AutotransporteCompleto, value: any) => {
    console.log(`Updating autotransporte ${field}:`, value);
    onChange({
      ...autotransporte,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Información del Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa_vm">Placa del Vehículo *</Label>
              <Input
                id="placa_vm"
                value={autotransporte.placa_vm || ''}
                onChange={(e) => updateField('placa_vm', e.target.value)}
                placeholder="ABC-123-D"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="anio_modelo_vm">Año del Modelo</Label>
              <Input
                id="anio_modelo_vm"
                type="number"
                value={autotransporte.anio_modelo_vm || ''}
                onChange={(e) => updateField('anio_modelo_vm', parseInt(e.target.value) || 0)}
                placeholder="2023"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
              <Input
                id="config_vehicular"
                value={autotransporte.config_vehicular || ''}
                onChange={(e) => updateField('config_vehicular', e.target.value)}
                placeholder="C2"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacidad_carga">Capacidad de Carga (kg)</Label>
              <Input
                id="capacidad_carga"
                type="number"
                value={autotransporte.capacidad_carga || ''}
                onChange={(e) => updateField('capacidad_carga', parseFloat(e.target.value) || 0)}
                placeholder="5000"
                className="w-full"
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
            <div className="space-y-2">
              <Label htmlFor="perm_sct">Permiso SCT</Label>
              <Input
                id="perm_sct"
                value={autotransporte.perm_sct || ''}
                onChange={(e) => updateField('perm_sct', e.target.value)}
                placeholder="TPAF03"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="num_permiso_sct">Número de Permiso</Label>
              <Input
                id="num_permiso_sct"
                value={autotransporte.num_permiso_sct || ''}
                onChange={(e) => updateField('num_permiso_sct', e.target.value)}
                placeholder="123456"
                className="w-full"
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
            <div className="space-y-2">
              <Label htmlFor="asegura_resp_civil">Aseguradora Responsabilidad Civil</Label>
              <Input
                id="asegura_resp_civil"
                value={autotransporte.asegura_resp_civil || ''}
                onChange={(e) => updateField('asegura_resp_civil', e.target.value)}
                placeholder="Nombre de la aseguradora"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="poliza_resp_civil">Póliza Responsabilidad Civil</Label>
              <Input
                id="poliza_resp_civil"
                value={autotransporte.poliza_resp_civil || ''}
                onChange={(e) => updateField('poliza_resp_civil', e.target.value)}
                placeholder="Número de póliza"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
