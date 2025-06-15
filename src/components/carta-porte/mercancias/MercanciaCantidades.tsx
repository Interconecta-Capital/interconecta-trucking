
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Package2, DollarSign } from 'lucide-react';

interface MercanciaCantidadesProps {
  formData: any;
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaCantidades({ formData, errors, onFieldChange }: MercanciaCantidadesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Scale className="h-5 w-5 text-green-500" />
        Cantidades y Valores
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cantidad">
            <Package2 className="h-4 w-4 inline mr-1" />
            Cantidad *
          </Label>
          <Input
            id="cantidad"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.cantidad || ''}
            onChange={(e) => onFieldChange('cantidad', parseFloat(e.target.value) || 0)}
            className={errors.cantidad ? 'border-red-500' : ''}
          />
          {errors.cantidad && (
            <p className="text-sm text-red-500">{errors.cantidad}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="peso_kg">
            <Scale className="h-4 w-4 inline mr-1" />
            Peso (kg) *
          </Label>
          <Input
            id="peso_kg"
            type="number"
            step="0.001"
            min="0"
            placeholder="0.000"
            value={formData.peso_kg || ''}
            onChange={(e) => onFieldChange('peso_kg', parseFloat(e.target.value) || 0)}
            className={errors.peso_kg ? 'border-red-500' : ''}
          />
          {errors.peso_kg && (
            <p className="text-sm text-red-500">{errors.peso_kg}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_mercancia">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Valor Unitario *
          </Label>
          <div className="flex gap-2">
            <Input
              id="valor_mercancia"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.valor_mercancia || ''}
              onChange={(e) => onFieldChange('valor_mercancia', parseFloat(e.target.value) || 0)}
              className={errors.valor_mercancia ? 'border-red-500' : ''}
            />
            <Select value={formData.moneda} onValueChange={(value) => onFieldChange('moneda', value)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MXN">MXN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.valor_mercancia && (
            <p className="text-sm text-red-500">{errors.valor_mercancia}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Valor Total:</span>
            <span className="ml-2 font-medium">
              ${((formData.cantidad || 0) * (formData.valor_mercancia || 0)).toLocaleString('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} {formData.moneda}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Peso Total:</span>
            <span className="ml-2 font-medium">
              {((formData.cantidad || 0) * (formData.peso_kg || 0)).toLocaleString('es-MX', {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3
              })} kg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
