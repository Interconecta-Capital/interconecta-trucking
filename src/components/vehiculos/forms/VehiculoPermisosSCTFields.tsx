
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface VehiculoPermisosSCTFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function VehiculoPermisosSCTFields({ formData, onFieldChange }: VehiculoPermisosSCTFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Permisos SCT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="perm_sct">Permiso SCT</Label>
            <Input
              id="perm_sct"
              value={formData.perm_sct || ''}
              onChange={(e) => onFieldChange('perm_sct', e.target.value)}
              placeholder="Tipo de permiso SCT"
            />
          </div>

          <div>
            <Label htmlFor="num_permiso_sct">Número de Permiso SCT</Label>
            <Input
              id="num_permiso_sct"
              value={formData.num_permiso_sct || ''}
              onChange={(e) => onFieldChange('num_permiso_sct', e.target.value)}
              placeholder="Número del permiso"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="vigencia_permiso">Vigencia del Permiso</Label>
          <Input
            id="vigencia_permiso"
            type="date"
            value={formData.vigencia_permiso || ''}
            onChange={(e) => onFieldChange('vigencia_permiso', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
