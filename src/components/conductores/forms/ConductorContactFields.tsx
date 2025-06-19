
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';

interface ConductorContactFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export function ConductorContactFields({ formData, onFieldChange, errors }: ConductorContactFieldsProps) {
  const handleAddressChange = (field: string, value: string) => {
    const currentAddress = formData.direccion || {};
    onFieldChange('direccion', {
      ...currentAddress,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Información de Contacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                className={errors?.email ? 'border-red-500' : ''}
              />
              {errors?.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dirección */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Dirección
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calle">Calle</Label>
              <Input
                id="calle"
                value={formData.direccion?.calle || ''}
                onChange={(e) => handleAddressChange('calle', e.target.value)}
                placeholder="Nombre de la calle"
              />
            </div>

            <div>
              <Label htmlFor="numero_exterior">Número Exterior</Label>
              <Input
                id="numero_exterior"
                value={formData.direccion?.numero_exterior || ''}
                onChange={(e) => handleAddressChange('numero_exterior', e.target.value)}
                placeholder="Número exterior"
              />
            </div>

            <div>
              <Label htmlFor="colonia">Colonia</Label>
              <Input
                id="colonia"
                value={formData.direccion?.colonia || ''}
                onChange={(e) => handleAddressChange('colonia', e.target.value)}
                placeholder="Colonia"
              />
            </div>

            <div>
              <Label htmlFor="codigo_postal">Código Postal</Label>
              <Input
                id="codigo_postal"
                value={formData.direccion?.codigo_postal || ''}
                onChange={(e) => handleAddressChange('codigo_postal', e.target.value)}
                placeholder="C.P."
                maxLength={5}
              />
            </div>

            <div>
              <Label htmlFor="municipio">Municipio</Label>
              <Input
                id="municipio"
                value={formData.direccion?.municipio || ''}
                onChange={(e) => handleAddressChange('municipio', e.target.value)}
                placeholder="Municipio"
              />
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.direccion?.estado || ''}
                onChange={(e) => handleAddressChange('estado', e.target.value)}
                placeholder="Estado"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
