
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IdCard } from 'lucide-react';

interface ConductorLicenciaFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export function ConductorLicenciaFields({ formData, onFieldChange, errors }: ConductorLicenciaFieldsProps) {
  const tiposLicencia = [
    { value: 'A', label: 'Tipo A - Motocicletas' },
    { value: 'B', label: 'Tipo B - Automóviles' },
    { value: 'C', label: 'Tipo C - Camiones hasta 3.5 ton' },
    { value: 'D', label: 'Tipo D - Camiones pesados' },
    { value: 'E', label: 'Tipo E - Transporte especializado' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IdCard className="h-5 w-5" />
          Información de Licencia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="num_licencia">Número de Licencia</Label>
            <Input
              id="num_licencia"
              value={formData.num_licencia || ''}
              onChange={(e) => onFieldChange('num_licencia', e.target.value)}
              placeholder="Número de licencia"
              className={errors?.num_licencia ? 'border-red-500' : ''}
            />
            {errors?.num_licencia && <p className="text-sm text-red-500 mt-1">{errors.num_licencia}</p>}
          </div>

          <div>
            <Label htmlFor="tipo_licencia">Tipo de Licencia</Label>
            <Select 
              value={formData.tipo_licencia || ''} 
              onValueChange={(value) => onFieldChange('tipo_licencia', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {tiposLicencia.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="vigencia_licencia">Vigencia de Licencia</Label>
          <Input
            id="vigencia_licencia"
            type="date"
            value={formData.vigencia_licencia || ''}
            onChange={(e) => onFieldChange('vigencia_licencia', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
