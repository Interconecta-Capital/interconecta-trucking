
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, Settings } from 'lucide-react';

interface VehiculoEspecificacionesFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function VehiculoEspecificacionesFields({ formData, onFieldChange }: VehiculoEspecificacionesFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Especificaciones Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
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
                min="0"
                step="0.01"
                value={formData.capacidad_carga || ''}
                onChange={(e) => onFieldChange('capacidad_carga', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Ej: 25000"
              />
            </div>

            <div>
              <Label htmlFor="peso_bruto_vehicular">Peso Bruto Vehicular (kg)</Label>
              <Input
                id="peso_bruto_vehicular"
                type="number"
                min="0"
                step="0.01"
                value={formData.peso_bruto_vehicular || ''}
                onChange={(e) => onFieldChange('peso_bruto_vehicular', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Ej: 40000"
              />
            </div>

            <div>
              <Label htmlFor="tipo_carroceria">Tipo de Carrocería</Label>
              <Input
                id="tipo_carroceria"
                value={formData.tipo_carroceria || ''}
                onChange={(e) => onFieldChange('tipo_carroceria', e.target.value)}
                placeholder="Ej: Semirremolque"
              />
            </div>

            <div>
              <Label htmlFor="configuracion_ejes">Configuración de Ejes</Label>
              <Select
                value={formData.configuracion_ejes || 'T3S2'}
                onValueChange={(value) => onFieldChange('configuracion_ejes', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar configuración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C2">C2 - Camión Unitario 2 Ejes</SelectItem>
                  <SelectItem value="C3">C3 - Camión Unitario 3 Ejes</SelectItem>
                  <SelectItem value="T2S1">T2S1 - Tractocamión 2 Ejes + Semirremolque 1 Eje</SelectItem>
                  <SelectItem value="T3S2">T3S2 - Tractocamión 3 Ejes + Semirremolque 2 Ejes</SelectItem>
                  <SelectItem value="T3S3">T3S3 - Tractocamión 3 Ejes + Semirremolque 3 Ejes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rendimiento y Combustible */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Rendimiento y Combustible
          </CardTitle>
        </CardHeader>  
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_combustible">Tipo de Combustible</Label>
              <Select
                value={formData.tipo_combustible || ''}
                onValueChange={(value) => onFieldChange('tipo_combustible', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar combustible" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="gasolina">Gasolina</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rendimiento">Rendimiento (km/litro)</Label>
              <Input
                id="rendimiento"
                type="number"
                min="0"
                step="0.1"
                value={formData.rendimiento || ''}
                onChange={(e) => onFieldChange('rendimiento', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Ej: 3.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Costos Operativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Costos Operativos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costo_mantenimiento_km">Costo Mantenimiento ($/km)</Label>
              <Input
                id="costo_mantenimiento_km"
                type="number"
                min="0"
                step="0.01"
                value={formData.costo_mantenimiento_km || ''}
                onChange={(e) => onFieldChange('costo_mantenimiento_km', e.target.value ? parseFloat(e.target.value) : 2.07)}
                placeholder="2.07"
              />
            </div>

            <div>
              <Label htmlFor="costo_llantas_km">Costo Llantas ($/km)</Label>
              <Input
                id="costo_llantas_km"
                type="number"
                min="0"
                step="0.01"
                value={formData.costo_llantas_km || ''}
                onChange={(e) => onFieldChange('costo_llantas_km', e.target.value ? parseFloat(e.target.value) : 1.08)}
                placeholder="1.08"
              />
            </div>

            <div>
              <Label htmlFor="factor_peajes">Factor de Peajes</Label>
              <Input
                id="factor_peajes"
                type="number"
                min="0"
                step="0.1"
                value={formData.factor_peajes || ''}
                onChange={(e) => onFieldChange('factor_peajes', e.target.value ? parseFloat(e.target.value) : 2.0)}
                placeholder="2.0"
              />
            </div>

            <div>
              <Label htmlFor="valor_vehiculo">Valor del Vehículo ($)</Label>
              <Input
                id="valor_vehiculo"
                type="number"
                min="0"
                step="1000"
                value={formData.valor_vehiculo || ''}
                onChange={(e) => onFieldChange('valor_vehiculo', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="800000"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p><strong>Información:</strong> Estos valores se utilizan para el cálculo profesional de costos operativos.</p>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Costo Mantenimiento:</strong> Incluye servicios, refacciones y reparaciones</li>
              <li>• <strong>Costo Llantas:</strong> Desgaste y reemplazo de llantas por kilometraje</li>
              <li>• <strong>Factor Peajes:</strong> Multiplicador según configuración de ejes</li>
              <li>• <strong>Valor Vehículo:</strong> Para cálculo de depreciación</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
