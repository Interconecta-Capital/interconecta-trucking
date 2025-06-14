
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

interface SocioBasicFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export function SocioBasicFields({ formData, onFieldChange, errors }: SocioBasicFieldsProps) {
  const tiposPersona = [
    { value: 'fisica', label: 'Persona Física' },
    { value: 'moral', label: 'Persona Moral' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Información Básica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nombre_razon_social">Nombre / Razón Social *</Label>
          <Input
            id="nombre_razon_social"
            value={formData.nombre_razon_social || ''}
            onChange={(e) => onFieldChange('nombre_razon_social', e.target.value)}
            placeholder="Nombre completo o razón social"
            className={errors?.nombre_razon_social ? 'border-red-500' : ''}
          />
          {errors?.nombre_razon_social && <p className="text-sm text-red-500 mt-1">{errors.nombre_razon_social}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rfc">RFC *</Label>
            <Input
              id="rfc"
              value={formData.rfc || ''}
              onChange={(e) => onFieldChange('rfc', e.target.value.toUpperCase())}
              placeholder="RFC del socio"
              maxLength={13}
              className={`uppercase ${errors?.rfc ? 'border-red-500' : ''}`}
            />
            {errors?.rfc && <p className="text-sm text-red-500 mt-1">{errors.rfc}</p>}
          </div>

          <div>
            <Label htmlFor="tipo_persona">Tipo de Persona *</Label>
            <Select 
              value={formData.tipo_persona || ''} 
              onValueChange={(value) => onFieldChange('tipo_persona', value)}
            >
              <SelectTrigger className={errors?.tipo_persona ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {tiposPersona.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.tipo_persona && <p className="text-sm text-red-500 mt-1">{errors.tipo_persona}</p>}
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
