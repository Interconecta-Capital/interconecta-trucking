
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CatalogSelect } from '@/components/catalogos/components/CatalogSelect';
import { Control } from 'react-hook-form';
import { Mercancia } from '@/hooks/useMercancias';

interface MercanciaBasicFieldsProps {
  control: Control<Mercancia>;
  productosQuery: any;
  unidadesQuery: any;
  embalajesQuery: any;
  productosSearch: string;
  unidadesSearch: string;
  embalajesSearch: string;
  setProductosSearch: (value: string) => void;
  setUnidadesSearch: (value: string) => void;
  setEmbalajesSearch: (value: string) => void;
}

export function MercanciaBasicFields({
  control,
  productosQuery,
  unidadesQuery,
  embalajesQuery,
  productosSearch,
  unidadesSearch,
  embalajesSearch,
  setProductosSearch,
  setUnidadesSearch,
  setEmbalajesSearch
}: MercanciaBasicFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="bienes_transp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Clave Producto/Servicio SAT *</FormLabel>
              <FormControl>
                <CatalogSelect
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setProductosSearch('');
                  }}
                  disabled={productosQuery.isPending}
                  showLoading={productosQuery.isPending}
                  placeholder="Buscar clave SAT..."
                  options={productosQuery.data || []}
                  searchTerm={productosSearch}
                  tipo="productos"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="clave_unidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Clave Unidad SAT *</FormLabel>
              <FormControl>
                <CatalogSelect
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setUnidadesSearch('');
                  }}
                  disabled={unidadesQuery.isPending}
                  showLoading={unidadesQuery.isPending}
                  placeholder="Buscar unidad..."
                  options={unidadesQuery.data || []}
                  searchTerm={unidadesSearch}
                  tipo="unidades"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="descripcion"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Descripción *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Descripción de la mercancía" 
                {...field}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="embalaje"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Tipo de Embalaje</FormLabel>
            <FormControl>
              <CatalogSelect
                value={field.value || ''}
                onValueChange={(value) => {
                  field.onChange(value);
                  setEmbalajesSearch('');
                }}
                disabled={embalajesQuery.isPending}
                showLoading={embalajesQuery.isPending}
                placeholder="Buscar tipo de embalaje..."
                options={embalajesQuery.data || []}
                searchTerm={embalajesSearch}
                tipo="embalajes"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="descripcion_detallada"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Descripción Detallada</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descripción más específica de la mercancía..."
                rows={3}
                {...field}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
