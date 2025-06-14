
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';

interface MercanciaBasicInfoProps {
  formData: any;
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaBasicInfo({ formData, errors, onFieldChange }: MercanciaBasicInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Información Básica</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="descripcion">Descripción de la Mercancía *</Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => onFieldChange('descripcion', e.target.value)}
            placeholder="Describe la mercancía que se transporta"
            className={errors.descripcion ? 'border-red-500' : ''}
            rows={3}
          />
          {errors.descripcion && <p className="text-sm text-red-500 mt-1">{errors.descripcion}</p>}
        </div>

        <CatalogoSelectorMejorado
          tipo="productos"
          label="Producto/Servicio (Clave SAT)"
          value={formData.bienes_transp}
          onValueChange={(value) => onFieldChange('bienes_transp', value)}
          placeholder="Buscar clave de producto..."
          required
          error={errors.bienes_transp}
        />

        <CatalogoSelectorMejorado
          tipo="unidades"
          label="Unidad de Medida"
          value={formData.clave_unidad}
          onValueChange={(value) => onFieldChange('clave_unidad', value)}
          placeholder="Buscar unidad..."
          required
          error={errors.clave_unidad}
        />
      </div>
    </div>
  );
}
