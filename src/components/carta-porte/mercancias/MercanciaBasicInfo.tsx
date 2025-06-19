
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CatalogSelect } from '@/components/catalogos/components/CatalogSelect';
import { useCatalogosHibrido } from '@/hooks/useCatalogosHibrido';
import { Package, Hash } from 'lucide-react';

interface MercanciaBasicInfoProps {
  formData: any;
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaBasicInfo({ formData, errors, onFieldChange }: MercanciaBasicInfoProps) {
  // Search states for catalogs
  const [productosSearch, setProductosSearch] = useState('');
  const [unidadesSearch, setUnidadesSearch] = useState('');
  const [embalajesSearch, setEmbalajesSearch] = useState('');

  // Catalog queries
  const productosQuery = useCatalogosHibrido('productos', productosSearch);
  const unidadesQuery = useCatalogosHibrido('unidades', unidadesSearch);
  const embalajesQuery = useCatalogosHibrido('embalajes', embalajesSearch);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Package className="h-5 w-5 text-blue-500" />
        Información Básica de la Mercancía
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Clave de Producto/Servicio SAT *</Label>
          <CatalogSelect
            value={formData.bienes_transp || ''}
            onValueChange={(value) => {
              onFieldChange('bienes_transp', value);
              setProductosSearch('');
            }}
            disabled={productosQuery.isPending}
            showLoading={productosQuery.isPending}
            placeholder="Buscar clave SAT..."
            options={productosQuery.data || []}
            searchTerm={productosSearch}
            tipo="productos"
          />
          {errors.bienes_transp && (
            <p className="text-sm text-red-500">{errors.bienes_transp}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Unidad de Medida SAT *</Label>
          <CatalogSelect
            value={formData.clave_unidad || ''}
            onValueChange={(value) => {
              onFieldChange('clave_unidad', value);
              setUnidadesSearch('');
            }}
            disabled={unidadesQuery.isPending}
            showLoading={unidadesQuery.isPending}
            placeholder="Buscar unidad..."
            options={unidadesQuery.data || []}
            searchTerm={unidadesSearch}
            tipo="unidades"
          />
          {errors.clave_unidad && (
            <p className="text-sm text-red-500">{errors.clave_unidad}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción *</Label>
        <Input
          id="descripcion"
          placeholder="Descripción de la mercancía"
          value={formData.descripcion || ''}
          onChange={(e) => onFieldChange('descripcion', e.target.value)}
          className={errors.descripcion ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
        />
        {errors.descripcion && (
          <p className="text-sm text-red-500">{errors.descripcion}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tipo de Embalaje</Label>
        <CatalogSelect
          value={formData.embalaje || ''}
          onValueChange={(value) => {
            onFieldChange('embalaje', value);
            setEmbalajesSearch('');
          }}
          disabled={embalajesQuery.isPending}
          showLoading={embalajesQuery.isPending}
          placeholder="Buscar tipo de embalaje..."
          options={embalajesQuery.data || []}
          searchTerm={embalajesSearch}
          tipo="embalajes"
        />
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
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500">
          Opcional: Código interno o identificador del fabricante
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion_detallada">Descripción Detallada</Label>
        <Textarea 
          id="descripcion_detallada"
          placeholder="Descripción más específica de la mercancía..."
          rows={3}
          value={formData.descripcion_detallada || ''}
          onChange={(e) => onFieldChange('descripcion_detallada', e.target.value)}
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
