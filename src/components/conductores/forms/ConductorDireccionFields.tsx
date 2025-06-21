
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface ConductorDireccionFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export function ConductorDireccionFields({ formData, onFieldChange, errors }: ConductorDireccionFieldsProps) {
  const handleAddressChange = (field: string, value: string) => {
    const currentAddress = formData.direccion || {};
    onFieldChange('direccion', {
      ...currentAddress,
      [field]: value
    });
  };

  const direccion = formData.direccion || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Dirección del Conductor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calle">Calle</Label>
            <Input
              id="calle"
              value={direccion.calle || ''}
              onChange={(e) => handleAddressChange('calle', e.target.value)}
              placeholder="Nombre de la calle"
            />
          </div>

          <div>
            <Label htmlFor="numero_exterior">Número Exterior</Label>
            <Input
              id="numero_exterior"
              value={direccion.numero_exterior || ''}
              onChange={(e) => handleAddressChange('numero_exterior', e.target.value)}
              placeholder="Número exterior"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numero_interior">Número Interior</Label>
            <Input
              id="numero_interior"
              value={direccion.numero_interior || ''}
              onChange={(e) => handleAddressChange('numero_interior', e.target.value)}
              placeholder="Número interior (opcional)"
            />
          </div>

          <div>
            <Label htmlFor="colonia">Colonia</Label>
            <Input
              id="colonia"
              value={direccion.colonia || ''}
              onChange={(e) => handleAddressChange('colonia', e.target.value)}
              placeholder="Colonia"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="codigo_postal">Código Postal</Label>
            <Input
              id="codigo_postal"
              value={direccion.codigo_postal || ''}
              onChange={(e) => handleAddressChange('codigo_postal', e.target.value)}
              placeholder="C.P."
              maxLength={5}
              pattern="[0-9]{5}"
            />
          </div>

          <div>
            <Label htmlFor="municipio">Municipio</Label>
            <Input
              id="municipio"
              value={direccion.municipio || ''}
              onChange={(e) => handleAddressChange('municipio', e.target.value)}
              placeholder="Municipio"
            />
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              value={direccion.estado || ''}
              onChange={(e) => handleAddressChange('estado', e.target.value)}
              placeholder="Estado"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="pais">País</Label>
          <Input
            id="pais"
            value={direccion.pais || 'México'}
            onChange={(e) => handleAddressChange('pais', e.target.value)}
            placeholder="País"
          />
        </div>

        <div>
          <Label htmlFor="referencias">Referencias</Label>
          <Input
            id="referencias"
            value={direccion.referencias || ''}
            onChange={(e) => handleAddressChange('referencias', e.target.value)}
            placeholder="Referencias adicionales de la dirección"
          />
        </div>
      </CardContent>
    </Card>
  );
}
