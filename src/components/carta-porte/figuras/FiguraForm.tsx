
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodigoPostalInput } from '@/components/catalogos/CodigoPostalInput';
import { FiguraTransporte } from '@/hooks/useFigurasTransporte';
import { User, Trash2 } from 'lucide-react';

export interface FiguraFormProps {
  figura: FiguraTransporte;
  onUpdate: (figura: FiguraTransporte) => void;
  onRemove: () => void;
  index: number;
}

const tiposFigura = [
  { value: '01', label: '01 - Operador' },
  { value: '02', label: '02 - Propietario' },
  { value: '03', label: '03 - Arrendador' },
  { value: '04', label: '04 - Notificado' },
];

export function FiguraForm({ figura, onUpdate, onRemove, index }: FiguraFormProps) {
  const [formData, setFormData] = useState<FiguraTransporte>(figura);

  useEffect(() => {
    setFormData(figura);
  }, [figura]);

  const handleChange = (field: string, value: any) => {
    const updatedFigura = { ...formData, [field]: value };
    setFormData(updatedFigura);
    onUpdate(updatedFigura);
  };

  const handleDomicilioChange = (field: string, value: string) => {
    const updatedDomicilio = { ...formData.domicilio, [field]: value };
    const updatedFigura = { ...formData, domicilio: updatedDomicilio };
    setFormData(updatedFigura);
    onUpdate(updatedFigura);
  };

  const handleCodigoPostalChange = (codigoPostal: string) => {
    handleDomicilioChange('codigo_postal', codigoPostal);
  };

  const handleInfoChange = (info: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => {
    if (info.estado) handleDomicilioChange('estado', info.estado);
    if (info.municipio) handleDomicilioChange('municipio', info.municipio);
    if (info.colonia) handleDomicilioChange('colonia', info.colonia);
  };

  const handleColoniaChange = (colonia: string) => {
    handleDomicilioChange('colonia', colonia);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Figura {index + 1}</span>
          </CardTitle>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de Figura *</Label>
            <Select
              value={formData.tipo_figura}
              onValueChange={(value) => handleChange('tipo_figura', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposFigura.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>RFC *</Label>
            <Input
              value={formData.rfc_figura}
              onChange={(e) => handleChange('rfc_figura', e.target.value.toUpperCase())}
              placeholder="RFC de la figura"
              maxLength={13}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre Completo *</Label>
            <Input
              value={formData.nombre_figura}
              onChange={(e) => handleChange('nombre_figura', e.target.value)}
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label>Número de Licencia</Label>
            <Input
              value={formData.num_licencia || ''}
              onChange={(e) => handleChange('num_licencia', e.target.value)}
              placeholder="Número de licencia"
            />
          </div>
        </div>

        {/* Domicilio */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Domicilio</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>País</Label>
              <Input
                value={formData.domicilio?.pais || 'México'}
                onChange={(e) => handleDomicilioChange('pais', e.target.value)}
                placeholder="País"
              />
            </div>

            <CodigoPostalInput
              value={formData.domicilio?.codigo_postal || ''}
              onValueChange={handleCodigoPostalChange}
              onInfoChange={handleInfoChange}
              onColoniaChange={handleColoniaChange}
              coloniaValue={formData.domicilio?.colonia || ''}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                value={formData.domicilio?.estado || ''}
                onChange={(e) => handleDomicilioChange('estado', e.target.value)}
                placeholder="Estado"
              />
            </div>

            <div className="space-y-2">
              <Label>Municipio</Label>
              <Input
                value={formData.domicilio?.municipio || ''}
                onChange={(e) => handleDomicilioChange('municipio', e.target.value)}
                placeholder="Municipio"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Colonia</Label>
              <Input
                value={formData.domicilio?.colonia || ''}
                onChange={(e) => handleDomicilioChange('colonia', e.target.value)}
                placeholder="Colonia"
              />
            </div>

            <div className="space-y-2">
              <Label>Calle</Label>
              <Input
                value={formData.domicilio?.calle || ''}
                onChange={(e) => handleDomicilioChange('calle', e.target.value)}
                placeholder="Nombre de la calle"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número Exterior</Label>
              <Input
                value={formData.domicilio?.numero_exterior || ''}
                onChange={(e) => handleDomicilioChange('numero_exterior', e.target.value)}
                placeholder="No. Exterior"
              />
            </div>

            <div className="space-y-2">
              <Label>Número Interior</Label>
              <Input
                value={formData.domicilio?.numero_interior || ''}
                onChange={(e) => handleDomicilioChange('numero_interior', e.target.value)}
                placeholder="No. Interior"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
