
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';
import { useBuscarClaveUnidadAdaptados } from '@/hooks/useCatalogosWithAdapters';

interface MercanciaCantidadesProps {
  formData: {
    clave_unidad: string;
    cantidad: number;
    peso_kg: number;
    valor_mercancia: number;
    moneda: string;
  };
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaCantidades({ formData, errors, onFieldChange }: MercanciaCantidadesProps) {
  const { data: clavesUnidad = [], isLoading: loadingUnidades } = useBuscarClaveUnidadAdaptados('');

  const calcularValorTotal = () => {
    if (formData.cantidad && formData.valor_mercancia) {
      return formData.cantidad * formData.valor_mercancia;
    }
    return 0;
  };

  if (loadingUnidades) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        Cantidades y Medidas
      </h4>
      
      <div>
        <Label htmlFor="clave_unidad">Unidad de Medida *</Label>
        <Select value={formData.clave_unidad} onValueChange={(value) => onFieldChange('clave_unidad', value)}>
          <SelectTrigger className={errors.clave_unidad ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecciona la unidad" />
          </SelectTrigger>
          <SelectContent>
            {clavesUnidad.map((unidad) => (
              <SelectItem key={unidad.value} value={unidad.value}>
                {unidad.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.clave_unidad && <p className="text-sm text-red-500 mt-1">{errors.clave_unidad}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="cantidad">Cantidad *</Label>
          <Input
            id="cantidad"
            type="number"
            step="0.01"
            min="0"
            value={formData.cantidad}
            onChange={(e) => onFieldChange('cantidad', parseFloat(e.target.value) || 0)}
            className={errors.cantidad ? 'border-red-500' : ''}
          />
          {errors.cantidad && <p className="text-sm text-red-500 mt-1">{errors.cantidad}</p>}
        </div>

        <div>
          <Label htmlFor="peso_kg">Peso (kg) *</Label>
          <Input
            id="peso_kg"
            type="number"
            step="0.01"
            min="0"
            value={formData.peso_kg}
            onChange={(e) => onFieldChange('peso_kg', parseFloat(e.target.value) || 0)}
            className={errors.peso_kg ? 'border-red-500' : ''}
          />
          {errors.peso_kg && <p className="text-sm text-red-500 mt-1">{errors.peso_kg}</p>}
        </div>

        <div>
          <Label htmlFor="valor_mercancia" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Valor Unitario
          </Label>
          <Input
            id="valor_mercancia"
            type="number"
            step="0.01"
            min="0"
            value={formData.valor_mercancia}
            onChange={(e) => onFieldChange('valor_mercancia', parseFloat(e.target.value) || 0)}
          />
          {calcularValorTotal() > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Valor Total: ${calcularValorTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })} {formData.moneda}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
