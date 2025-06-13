
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodigoPostalInput } from '@/components/catalogos/CodigoPostalInput';

interface UbicacionDomicilioSectionProps {
  domicilio: {
    pais: string;
    codigoPostal: string;
    estado: string;
    municipio: string;
    localidad?: string;
    colonia: string;
    calle: string;
    numExterior: string;
    numInterior?: string;
    referencia?: string;
  };
  distanciaRecorrida: number;
  onDomicilioChange: (field: string, value: string) => void;
  onDistanciaChange: (distancia: number) => void;
  onCodigoPostalChange: (codigoPostal: string) => void;
  onInfoChange: (info: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => void;
  onColoniaChange: (colonia: string) => void;
}

export function UbicacionDomicilioSection({
  domicilio,
  distanciaRecorrida,
  onDomicilioChange,
  onDistanciaChange,
  onCodigoPostalChange,
  onInfoChange,
  onColoniaChange
}: UbicacionDomicilioSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Domicilio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>País *</Label>
            <Input 
              placeholder="México" 
              value={domicilio.pais}
              onChange={(e) => onDomicilioChange('pais', e.target.value)}
            />
          </div>

          <CodigoPostalInput
            value={domicilio.codigoPostal}
            onValueChange={onCodigoPostalChange}
            onInfoChange={onInfoChange}
            onColoniaChange={onColoniaChange}
            coloniaValue={domicilio.colonia}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estado *</Label>
            <Input 
              placeholder="Estado" 
              value={domicilio.estado}
              onChange={(e) => onDomicilioChange('estado', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Municipio *</Label>
            <Input 
              placeholder="Municipio" 
              value={domicilio.municipio}
              onChange={(e) => onDomicilioChange('municipio', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Localidad</Label>
            <Input 
              placeholder="Localidad" 
              value={domicilio.localidad || ''}
              onChange={(e) => onDomicilioChange('localidad', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Colonia *</Label>
            <Input 
              placeholder="Colonia" 
              value={domicilio.colonia}
              onChange={(e) => onDomicilioChange('colonia', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Calle *</Label>
          <Input 
            placeholder="Nombre de la calle" 
            value={domicilio.calle}
            onChange={(e) => onDomicilioChange('calle', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Número Exterior *</Label>
            <Input 
              placeholder="No. Ext." 
              value={domicilio.numExterior}
              onChange={(e) => onDomicilioChange('numExterior', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Número Interior</Label>
            <Input 
              placeholder="No. Int." 
              value={domicilio.numInterior || ''}
              onChange={(e) => onDomicilioChange('numInterior', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Referencias</Label>
            <Input 
              placeholder="Referencias adicionales" 
              value={domicilio.referencia || ''}
              onChange={(e) => onDomicilioChange('referencia', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Distancia Recorrida (KM)</Label>
          <Input 
            type="number" 
            placeholder="0" 
            value={distanciaRecorrida}
            onChange={(e) => onDistanciaChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
