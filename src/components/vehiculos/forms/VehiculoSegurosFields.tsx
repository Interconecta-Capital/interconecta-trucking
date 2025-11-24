
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface VehiculoSegurosFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function VehiculoSegurosFields({ formData, onFieldChange }: VehiculoSegurosFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Información de Seguros SAT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="asegura_resp_civil">
              Aseguradora Responsabilidad Civil <span className="text-destructive">*</span>
            </Label>
            <Input
              id="asegura_resp_civil"
              value={formData.asegura_resp_civil || ''}
              onChange={(e) => onFieldChange('asegura_resp_civil', e.target.value)}
              placeholder="Nombre de la aseguradora"
              required
              className={!formData.asegura_resp_civil ? 'border-amber-500' : ''}
            />
            {!formData.asegura_resp_civil && (
              <p className="text-xs text-amber-600 mt-1">⚠️ Requerido para timbrado</p>
            )}
          </div>

          <div>
            <Label htmlFor="poliza_resp_civil">
              Póliza Responsabilidad Civil <span className="text-destructive">*</span>
            </Label>
            <Input
              id="poliza_resp_civil"
              value={formData.poliza_resp_civil || formData.poliza_seguro || ''}
              onChange={(e) => onFieldChange('poliza_resp_civil', e.target.value)}
              placeholder="Número de póliza"
              required
              className={!formData.poliza_resp_civil ? 'border-amber-500' : ''}
            />
            {!formData.poliza_resp_civil && (
              <p className="text-xs text-amber-600 mt-1">⚠️ Requerido para timbrado</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="asegura_med_ambiente">Aseguradora Medio Ambiente</Label>
            <Input
              id="asegura_med_ambiente"
              value={formData.asegura_med_ambiente || ''}
              onChange={(e) => onFieldChange('asegura_med_ambiente', e.target.value)}
              placeholder="Aseguradora de daños al medio ambiente"
            />
          </div>

          <div>
            <Label htmlFor="poliza_med_ambiente">Póliza Medio Ambiente</Label>
            <Input
              id="poliza_med_ambiente"
              value={formData.poliza_med_ambiente || ''}
              onChange={(e) => onFieldChange('poliza_med_ambiente', e.target.value)}
              placeholder="Número de póliza"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="vigencia_seguro">Vigencia del Seguro</Label>
          <Input
            id="vigencia_seguro"
            type="date"
            value={formData.vigencia_seguro || ''}
            onChange={(e) => onFieldChange('vigencia_seguro', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
