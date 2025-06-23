
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VehiculoBasicFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export function VehiculoBasicFields({ formData, onFieldChange, errors }: VehiculoBasicFieldsProps) {
  const configuracionesVehiculares = [
    { value: 'C2', label: 'C2 - Camión Unitario (2 ejes)' },
    { value: 'C3', label: 'C3 - Camión Unitario (3 ejes)' },
    { value: 'T3S2', label: 'T3S2 - Tractocamión con Semirremolque' },
    { value: 'T3S3', label: 'T3S3 - Tractocamión con Semirremolque' },
    { value: 'T3S2R4', label: 'T3S2R4 - Tractocamión con Semirremolque y Remolque' },
    { value: 'B2', label: 'B2 - Autobús' },
    { value: 'C4', label: 'C4 - Camión Unitario (4 ejes)' }
  ];

  const tiposCombustible = [
    { value: 'Gasolina', label: 'Gasolina' },
    { value: 'Diésel', label: 'Diésel' },
    { value: 'Eléctrico', label: 'Eléctrico' },
    { value: 'Híbrido', label: 'Híbrido' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Información Básica</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="placa">Placa *</Label>
          <Input
            id="placa"
            value={formData.placa || ''}
            onChange={(e) => onFieldChange('placa', e.target.value.toUpperCase())}
            placeholder="ABC-123"
            className={errors?.placa ? 'border-red-500' : ''}
          />
          {errors?.placa && <p className="text-sm text-red-500 mt-1">{errors.placa}</p>}
        </div>

        <div>
          <Label htmlFor="marca">Marca</Label>
          <Input
            id="marca"
            value={formData.marca || ''}
            onChange={(e) => onFieldChange('marca', e.target.value)}
            placeholder="Toyota, Volvo, etc."
          />
        </div>

        <div>
          <Label htmlFor="modelo">Modelo</Label>
          <Input
            id="modelo"
            value={formData.modelo || ''}
            onChange={(e) => onFieldChange('modelo', e.target.value)}
            placeholder="Hilux, FH16, etc."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="anio">Año</Label>
          <Input
            id="anio"
            type="number"
            min="1990"
            max={new Date().getFullYear() + 1}
            value={formData.anio || ''}
            onChange={(e) => onFieldChange('anio', parseInt(e.target.value) || '')}
          />
        </div>

        <div>
          <Label htmlFor="numero_serie_vin">Número de Serie (VIN)</Label>
          <Input
            id="numero_serie_vin"
            value={formData.numero_serie_vin || formData.num_serie || ''}
            onChange={(e) => onFieldChange('numero_serie_vin', e.target.value)}
            placeholder="VIN del vehículo"
          />
        </div>

        <div>
          <Label htmlFor="tipo_combustible">Tipo de Combustible</Label>
          <Select 
            value={formData.tipo_combustible || ''} 
            onValueChange={(value) => onFieldChange('tipo_combustible', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar combustible..." />
            </SelectTrigger>
            <SelectContent>
              {tiposCombustible.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
          <Select 
            value={formData.config_vehicular || ''} 
            onValueChange={(value) => onFieldChange('config_vehicular', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar configuración..." />
            </SelectTrigger>
            <SelectContent>
              {configuracionesVehiculares.map((config) => (
                <SelectItem key={config.value} value={config.value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="rendimiento">Rendimiento (km/l)</Label>
          <Input
            id="rendimiento"
            type="number"
            step="0.1"
            min="0"
            value={formData.rendimiento || ''}
            onChange={(e) => onFieldChange('rendimiento', parseFloat(e.target.value) || '')}
            placeholder="15.5"
          />
        </div>
      </div>
    </div>
  );
}
