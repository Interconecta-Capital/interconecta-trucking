
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, DollarSign, Package } from 'lucide-react';

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
            <Package className="h-4 w-4 inline mr-1" />
            Cantidad *
          </Label>
          <Input
            id="cantidad"
            type="number"
            placeholder="0"
            value={formData.cantidad || ''}
            onChange={(e) => {
              const value = e.target.value;
              onFieldChange('cantidad', value ? parseFloat(value) : 0);
            }}
            className={errors.cantidad ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
            min="0"
            step="0.01"
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
            placeholder="0.00"
            step="0.01"
            value={formData.peso_kg || ''}
            onChange={(e) => {
              const value = e.target.value;
              onFieldChange('peso_kg', value ? parseFloat(value) : 0);
            }}
            className={errors.peso_kg ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
            min="0"
          />
          {errors.peso_kg && (
            <p className="text-sm text-red-500">{errors.peso_kg}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_mercancia">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Valor *
          </Label>
          <Input
            id="valor_mercancia"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.valor_mercancia || ''}
            onChange={(e) => {
              const value = e.target.value;
              onFieldChange('valor_mercancia', value ? parseFloat(value) : 0);
            }}
            className={errors.valor_mercancia ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
            min="0"
          />
          {errors.valor_mercancia && (
            <p className="text-sm text-red-500">{errors.valor_mercancia}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="moneda">Moneda</Label>
        <Select
          value={formData.moneda || 'MXN'}
          onValueChange={(value) => onFieldChange('moneda', value)}
        >
          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
            <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
            <SelectItem value="EUR">Euro (EUR)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
