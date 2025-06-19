
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Save, X } from 'lucide-react';
import { CatalogSelect } from '@/components/catalogos/components/CatalogSelect';
import { useCatalogosHibrido } from '@/hooks/useCatalogosHibrido';
import { AIAssistantButton } from './AIAssistantButton';
import { Mercancia } from '@/hooks/useMercancias';
import { useState } from 'react';

interface MercanciaFormProps {
  index: number;
  onRemove?: () => void;
  mercancia?: Mercancia;
  onSave?: (mercancia: Mercancia) => Promise<boolean> | boolean;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MercanciaForm({ index, onRemove, mercancia, onSave, onCancel, isLoading }: MercanciaFormProps) {
  const form = useForm<Mercancia>({
    defaultValues: mercancia || {
      bienes_transp: '',
      descripcion: '',
      cantidad: 0,
      clave_unidad: '',
      peso_kg: 0,
      valor_mercancia: 0,
      material_peligroso: false,
      cve_material_peligroso: '',
      moneda: 'MXN',
      embalaje: '',
      fraccion_arancelaria: '',
      uuid_comercio_ext: '',
      descripcion_detallada: '',
      numero_piezas: undefined,
      tipo_embalaje: '',
      regimen_aduanero: '',
      codigo_producto: ''
    }
  });
  
  const materialPeligroso = form.watch('material_peligroso') || false;

  // Search states for catalogs
  const [productosSearch, setProductosSearch] = useState('');
  const [unidadesSearch, setUnidadesSearch] = useState('');
  const [embalajesSearch, setEmbalajesSearch] = useState('');
  const [materialesSearch, setMaterialesSearch] = useState('');

  // Catalog queries
  const productosQuery = useCatalogosHibrido('productos', productosSearch);
  const unidadesQuery = useCatalogosHibrido('unidades', unidadesSearch);
  const embalajesQuery = useCatalogosHibrido('embalajes', embalajesSearch);
  const materialesQuery = useCatalogosHibrido('materiales_peligrosos', materialesSearch);

  const handleAISuggestion = (suggestion: any) => {
    if (suggestion.data) {
      // Apply AI suggestion to form with proper type checking
      Object.entries(suggestion.data).forEach(([key, value]) => {
        if (key === 'bienes_transp' || key === 'clave_unidad' || key === 'descripcion' || key === 'embalaje') {
          form.setValue(key as keyof Mercancia, String(value));
        } else if (key === 'cantidad' || key === 'peso_kg' || key === 'valor_mercancia') {
          form.setValue(key as keyof Mercancia, Number(value) || 0);
        } else if (key === 'material_peligroso') {
          form.setValue(key as keyof Mercancia, Boolean(value));
        } else if (key === 'cve_material_peligroso') {
          form.setValue(key as keyof Mercancia, String(value));
        }
      });
    }
  };

  const handleSave = async (data: Mercancia) => {
    if (onSave) {
      const result = await onSave(data);
      if (result && onCancel) {
        onCancel();
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h4 className="text-lg font-semibold text-gray-900">Mercancía {index + 1}</h4>
          <div className="flex gap-2">
            <AIAssistantButton 
              context="mercancias"
              onSuggestionApply={handleAISuggestion}
            />
            {onRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemove}
                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
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
            control={form.control}
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
          control={form.control}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fraccion_arancelaria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Fracción Arancelaria</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="8 dígitos (ej: 12345678)" 
                    maxLength={8}
                    {...field}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="regimen_aduanero"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Régimen Aduanero</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: A1, B1, etc." 
                    {...field}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="cantidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Cantidad *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="peso_kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Peso (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valor_mercancia"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Valor ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="numero_piezas"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Número de Piezas</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Cantidad de piezas"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="uuid_comercio_ext"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">UUID Comercio Exterior</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Para operaciones de comercio exterior"
                    {...field}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
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

        <FormField
          control={form.control}
          name="material_peligroso"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium text-gray-700">Material Peligroso</FormLabel>
                <div className="text-sm text-gray-500">
                  ¿Esta mercancía es considerada material peligroso?
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {materialPeligroso && (
          <FormField
            control={form.control}
            name="cve_material_peligroso"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Clave Material Peligroso *</FormLabel>
                <FormControl>
                  <CatalogSelect
                    value={field.value || ''}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setMaterialesSearch('');
                    }}
                    disabled={materialesQuery.isPending}
                    showLoading={materialesQuery.isPending}
                    placeholder="Buscar material peligroso..."
                    options={materialesQuery.data || []}
                    searchTerm={materialesSearch}
                    tipo="materiales_peligrosos"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
