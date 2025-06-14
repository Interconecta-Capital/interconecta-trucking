
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

interface ConductorBasicFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export function ConductorBasicFields({ formData, onFieldChange, errors }: ConductorBasicFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre completo *</Label>
          <Input
            id="nombre"
            value={formData.nombre || ''}
            onChange={(e) => onFieldChange('nombre', e.target.value)}
            placeholder="Nombre completo del conductor"
            className={errors?.nombre ? 'border-red-500' : ''}
          />
          {errors?.nombre && <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              value={formData.rfc || ''}
              onChange={(e) => onFieldChange('rfc', e.target.value.toUpperCase())}
              placeholder="RFC del conductor"
              maxLength={13}
              className="uppercase"
            />
          </div>

          <div>
            <Label htmlFor="curp">CURP</Label>
            <Input
              id="curp"
              value={formData.curp || ''}
              onChange={(e) => onFieldChange('curp', e.target.value.toUpperCase())}
              placeholder="CURP del conductor"
              maxLength={18}
              className="uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono || ''}
              onChange={(e) => onFieldChange('telefono', e.target.value)}
              placeholder="Número de teléfono"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
