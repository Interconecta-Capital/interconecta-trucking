
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';

interface PermisoSCTFormProps {
  data: {
    perm_sct: string;
    num_permiso_sct: string;
  };
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export function PermisoSCTForm({ data, onChange, errors }: PermisoSCTFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permiso SCT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CatalogoSelectorMejorado
            tipo="tipos_permiso"
            label="Tipo de Permiso SCT"
            value={data.perm_sct}
            onValueChange={(value) => onChange('perm_sct', value)}
            placeholder="Selecciona tipo de permiso"
            required
            error={errors.perm_sct}
          />

          <div>
            <Label htmlFor="num_permiso_sct">Número de Permiso SCT *</Label>
            <Input
              id="num_permiso_sct"
              value={data.num_permiso_sct}
              onChange={(e) => onChange('num_permiso_sct', e.target.value)}
              placeholder="Número de permiso"
              className={errors.num_permiso_sct ? 'border-red-500' : ''}
            />
            {errors.num_permiso_sct && <p className="text-sm text-red-500 mt-1">{errors.num_permiso_sct}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
