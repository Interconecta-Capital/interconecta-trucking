import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { CodigoPostalSelector } from '@/components/catalogos/CodigoPostalSelector';

interface DireccionData {
  codigoPostal: string;
  estado: string;
  municipio: string;
  colonia: string;
  calle: string;
  numExterior?: string;
  numInterior?: string;
  localidad?: string;
  referencia?: string;
}

interface DireccionCompletaFormProps {
  value: DireccionData;
  onChange: (direccion: DireccionData) => void;
  disabled?: boolean;
  showCard?: boolean;
  title?: string;
}

export function DireccionCompletaForm({ 
  value, 
  onChange, 
  disabled = false,
  showCard = true,
  title = "Domicilio Completo"
}: DireccionCompletaFormProps) {
  const [colonias, setColonias] = useState<string[]>([]);
  
  const handleCodigoPostalSelect = (cp: string, data: any) => {
    console.log('📍 Código postal seleccionado:', cp, data);
    
    const updatedDireccion = {
      ...value,
      codigoPostal: cp,
      estado: data?.estado || '',
      municipio: data?.municipio || '',
      localidad: data?.localidad || data?.municipio || ''
    };
    
    onChange(updatedDireccion);
    
    // Guardar colonias disponibles
    if (data?.colonias) {
      const nombresColonias = data.colonias.map((c: any) => 
        typeof c === 'string' ? c : c.nombre
      );
      setColonias(nombresColonias);
      
      // Si solo hay una colonia, seleccionarla automáticamente
      if (nombresColonias.length === 1) {
        onChange({
          ...updatedDireccion,
          colonia: nombresColonias[0]
        });
      }
    }
  };

  const handleFieldChange = (field: keyof DireccionData, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue
    });
  };

  const content = (
    <div className="space-y-4">
      {/* Código Postal con Selector */}
      <div className="space-y-2">
        <Label>Código Postal *</Label>
        <CodigoPostalSelector
          value={value.codigoPostal || ''}
          onValueChange={handleCodigoPostalSelect}
          placeholder="Buscar código postal..."
          disabled={disabled}
        />
      </div>

      {/* Estado y Municipio (readonly, autocompletados) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Estado *</Label>
          <Input
            value={value.estado || ''}
            placeholder="Se autocompleta con el C.P."
            readOnly
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label>Municipio *</Label>
          <Input
            value={value.municipio || ''}
            placeholder="Se autocompleta con el C.P."
            readOnly
            className="bg-muted"
          />
        </div>
      </div>

      {/* Colonia */}
      {colonias.length > 1 ? (
        <div className="space-y-2">
          <Label>Colonia *</Label>
          <Select
            value={value.colonia || ''}
            onValueChange={(newValue) => handleFieldChange('colonia', newValue)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar colonia" />
            </SelectTrigger>
            <SelectContent>
              {colonias.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Colonia *</Label>
          <Input
            value={value.colonia || ''}
            onChange={(e) => handleFieldChange('colonia', e.target.value)}
            placeholder="Nombre de la colonia"
            disabled={disabled}
          />
        </div>
      )}

      {/* Calle y números */}
      <div className="space-y-2">
        <Label>Calle *</Label>
        <Input
          value={value.calle || ''}
          onChange={(e) => handleFieldChange('calle', e.target.value)}
          placeholder="Av. Principal"
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Número Exterior</Label>
          <Input
            value={value.numExterior || ''}
            onChange={(e) => handleFieldChange('numExterior', e.target.value)}
            placeholder="123"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label>Número Interior</Label>
          <Input
            value={value.numInterior || ''}
            onChange={(e) => handleFieldChange('numInterior', e.target.value)}
            placeholder="A"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Referencia opcional */}
      <div className="space-y-2">
        <Label>Referencia (Opcional)</Label>
        <Input
          value={value.referencia || ''}
          onChange={(e) => handleFieldChange('referencia', e.target.value)}
          placeholder="Entre calle X y Y"
          disabled={disabled}
        />
      </div>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
