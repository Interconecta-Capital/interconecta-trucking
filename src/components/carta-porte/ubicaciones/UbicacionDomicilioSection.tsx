
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodigoPostalInput } from '@/components/catalogos/CodigoPostalInput';
import { useEstados } from '@/hooks/useCatalogos';
import { Ubicacion } from '@/hooks/useUbicaciones';

interface UbicacionDomicilioSectionProps {
  domicilio: Ubicacion['domicilio'];
  distanciaRecorrida: number;
  onDomicilioChange: (field: string, value: string) => void;
  onDistanciaChange: (distancia: number) => void;
  onCodigoPostalChange: (codigoPostal: string) => void;
  onInfoChange: (info: any) => void;
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
  const { data: estados = [] } = useEstados();

  const handlePaisChange = (value: string) => {
    if (value) {
      onDomicilioChange('pais', value);
    }
  };

  const handleEstadoChange = (value: string) => {
    if (value) {
      onDomicilioChange('estado', value);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Domicilio</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>País</Label>
          <Select 
            value={domicilio.pais || 'MEX'} 
            onValueChange={handlePaisChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEX">México</SelectItem>
              <SelectItem value="USA">Estados Unidos</SelectItem>
              <SelectItem value="CAN">Canadá</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CodigoPostalInput
          value={domicilio.codigoPostal}
          onValueChange={onCodigoPostalChange}
          onInfoChange={onInfoChange}
          coloniaValue={domicilio.colonia}
          onColoniaChange={onColoniaChange}
          required
        />

        <div className="space-y-2">
          <Label>Estado *</Label>
          <Select 
            value={domicilio.estado || ''} 
            onValueChange={handleEstadoChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar estado..." />
            </SelectTrigger>
            <SelectContent>
              {estados.map((estado) => (
                <SelectItem key={estado.clave} value={estado.clave}>
                  {estado.clave} - {estado.descripcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Municipio</Label>
          <Input
            value={domicilio.municipio}
            onChange={(e) => onDomicilioChange('municipio', e.target.value)}
            placeholder="Municipio"
          />
        </div>

        <div className="space-y-2">
          <Label>Calle *</Label>
          <Input
            value={domicilio.calle}
            onChange={(e) => onDomicilioChange('calle', e.target.value)}
            placeholder="Nombre de la calle"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Número Exterior *</Label>
          <Input
            value={domicilio.numExterior}
            onChange={(e) => onDomicilioChange('numExterior', e.target.value)}
            placeholder="123"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Número Interior</Label>
          <Input
            value={domicilio.numInterior || ''}
            onChange={(e) => onDomicilioChange('numInterior', e.target.value)}
            placeholder="A"
          />
        </div>

        <div className="space-y-2">
          <Label>Distancia Recorrida (km)</Label>
          <Input
            type="number"
            value={distanciaRecorrida || ''}
            onChange={(e) => onDistanciaChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Referencia</Label>
        <Input
          value={domicilio.referencia || ''}
          onChange={(e) => onDomicilioChange('referencia', e.target.value)}
          placeholder="Entre calle X y Y, frente al edificio Z"
        />
      </div>
    </div>
  );
}
