
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { Package, Hash } from 'lucide-react';

interface MercanciaBasicInfoProps {
  formData: any;
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaBasicInfo({ formData, errors, onFieldChange }: MercanciaBasicInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Package className="h-5 w-5 text-blue-500" />
        Información Básica de la Mercancía
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción *</Label>
          <Textarea
            id="descripcion"
            placeholder="Descripción detallada de la mercancía..."
            value={formData.descripcion}
            onChange={(e) => onFieldChange('descripcion', e.target.value)}
            className={errors.descripcion ? 'border-red-500' : ''}
            rows={3}
          />
          {errors.descripcion && (
            <p className="text-sm text-red-500">{errors.descripcion}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigo_producto">
            <Hash className="h-4 w-4 inline mr-1" />
            Código/ID del Producto
          </Label>
          <Input
            id="codigo_producto"
            placeholder="Código interno, SKU, o identificador del fabricante"
            value={formData.codigo_producto || ''}
            onChange={(e) => onFieldChange('codigo_producto', e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Opcional: Código interno o identificador del fabricante
          </p>
        </div>

        <CatalogoSelectorMejorado
          tipo="productos"
          label="Clave de Producto/Servicio SAT"
          value={formData.bienes_transp}
          onValueChange={(value) => onFieldChange('bienes_transp', value)}
          placeholder="Seleccionar clave SAT..."
          required
          error={errors.bienes_transp}
          allowSearch={false}
          showAllOptions={true}
          showRefresh={true}
        />

        <CatalogoSelectorMejorado
          tipo="unidades"
          label="Unidad de Medida SAT"
          value={formData.clave_unidad}
          onValueChange={(value) => onFieldChange('clave_unidad', value)}
          placeholder="Seleccionar unidad..."
          required
          error={errors.clave_unidad}
          allowSearch={false}
          showAllOptions={true}
          showRefresh={true}
        />
      </div>
    </div>
  );
}
