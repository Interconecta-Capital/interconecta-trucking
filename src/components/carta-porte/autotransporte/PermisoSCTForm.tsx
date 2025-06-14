
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';
import { useTiposPermiso } from '@/hooks/useCatalogos';

interface PermisoSCTFormProps {
  data: {
    perm_sct: string;
    num_permiso_sct: string;
  };
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export function PermisoSCTForm({ data, onChange, errors }: PermisoSCTFormProps) {
  const { data: tiposPermiso = [], isLoading } = useTiposPermiso();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

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
          <div>
            <Label htmlFor="perm_sct">Tipo de Permiso SCT *</Label>
            <Select value={data.perm_sct} onValueChange={(value) => onChange('perm_sct', value)}>
              <SelectTrigger className={errors.perm_sct ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona tipo de permiso" />
              </SelectTrigger>
              <SelectContent>
                {tiposPermiso.map((permiso) => (
                  <SelectItem key={permiso.clave || permiso.descripcion} value={permiso.clave || permiso.descripcion}>
                    {permiso.clave || permiso.descripcion} - {permiso.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.perm_sct && <p className="text-sm text-red-500 mt-1">{errors.perm_sct}</p>}
          </div>

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
