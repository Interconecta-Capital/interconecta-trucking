
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck } from 'lucide-react';

interface VehiculoEspecificacionesFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function VehiculoEspecificacionesFields({ formData, onFieldChange }: VehiculoEspecificacionesFieldsProps) {
  const tiposCarroceria = [
    'Caja seca',
    'Refrigerada',
    'Tanque',
    'Plataforma',
    'Tolva',
    'Portavehículos',
    'Grúa',
    'Otros'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Especificaciones Técnicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="capacidad_carga">Capacidad de Carga (kg)</Label>
            <Input
              id="capacidad_carga"
              type="number"
              step="0.01"
              value={formData.capacidad_carga || ''}
              onChange={(e) => onFieldChange('capacidad_carga', parseFloat(e.target.value) || '')}
              placeholder="Capacidad en kilogramos"
            />
          </div>

          <div>
            <Label htmlFor="peso_bruto_vehicular">Peso Bruto Vehicular (kg)</Label>
            <Input
              id="peso_bruto_vehicular"
              type="number"
              step="0.01"
              value={formData.peso_bruto_vehicular || ''}
              onChange={(e) => onFieldChange('peso_bruto_vehicular', parseFloat(e.target.value) || '')}
              placeholder="Peso bruto en kilogramos"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="tipo_carroceria">Tipo de Carrocería</Label>
          <Select 
            value={formData.tipo_carroceria || ''} 
            onValueChange={(value) => onFieldChange('tipo_carroceria', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo de carrocería..." />
            </SelectTrigger>
            <SelectContent>
              {tiposCarroceria.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="verificacion_vigencia">Vigencia de Verificación</Label>
            <Input
              id="verificacion_vigencia"
              type="date"
              value={formData.verificacion_vigencia || ''}
              onChange={(e) => onFieldChange('verificacion_vigencia', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
