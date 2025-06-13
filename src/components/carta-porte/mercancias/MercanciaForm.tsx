
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { AIAssistantButton } from './AIAssistantButton';
import { useBuscarProductosServicios, useBuscarClaveUnidad, useBuscarMaterialesPeligrosos } from '@/hooks/useCatalogos';
import { useFormContext } from 'react-hook-form';
import { Mercancia } from '@/hooks/useMercancias';

interface MercanciaFormProps {
  index: number;
  onRemove: () => void;
  mercancia?: Mercancia;
  onSave?: (mercancia: Mercancia) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MercanciaForm({ index, onRemove, mercancia, onSave, onCancel, isLoading }: MercanciaFormProps) {
  const form = useFormContext();
  
  const [productoSearch, setProductoSearch] = React.useState('');
  const [unidadSearch, setUnidadSearch] = React.useState('');
  const [materialSearch, setMaterialSearch] = React.useState('');
  
  const materialPeligroso = form.watch(`mercancias.${index}.material_peligroso`) || false;
  
  const { data: productos = [], isLoading: loadingProductos } = useBuscarProductosServicios(
    productoSearch,
    true
  );
  
  const { data: unidades = [], isLoading: loadingUnidades } = useBuscarClaveUnidad(
    unidadSearch,
    true
  );
  
  const { data: materiales = [], isLoading: loadingMateriales } = useBuscarMaterialesPeligrosos(
    materialSearch,
    materialPeligroso && materialSearch.length >= 2
  );

  const handleAISuggestion = (suggestion: any) => {
    if (suggestion.data) {
      // Apply AI suggestion to form
      Object.entries(suggestion.data).forEach(([key, value]) => {
        if (key === 'bienes_transp' || key === 'clave_unidad' || key === 'descripcion' || 
            key === 'cantidad' || key === 'peso_kg' || key === 'valor_mercancia') {
          form.setValue(`mercancias.${index}.${key}`, value);
        }
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Mercancía {index + 1}</h4>
        <div className="flex gap-2">
          <AIAssistantButton 
            context="mercancias"
            onSuggestionApply={handleAISuggestion}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`mercancias.${index}.bienes_transp`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clave Producto/Servicio *</FormLabel>
              <FormControl>
                <CatalogoSelector
                  items={productos}
                  loading={loadingProductos}
                  placeholder="Buscar clave de producto..."
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearchChange={setProductoSearch}
                  searchValue={productoSearch}
                  allowManualInput={true}
                  manualInputPlaceholder="Escribir clave manualmente"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`mercancias.${index}.clave_unidad`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clave Unidad *</FormLabel>
              <FormControl>
                <CatalogoSelector
                  items={unidades}
                  loading={loadingUnidades}
                  placeholder="Buscar unidad..."
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearchChange={setUnidadSearch}
                  searchValue={unidadSearch}
                  allowManualInput={true}
                  manualInputPlaceholder="Escribir unidad manualmente"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`mercancias.${index}.descripcion`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción *</FormLabel>
            <FormControl>
              <Input placeholder="Descripción de la mercancía" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name={`mercancias.${index}.cantidad`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`mercancias.${index}.peso_kg`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peso (kg)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`mercancias.${index}.valor_mercancia`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`mercancias.${index}.material_peligroso`}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>Material Peligroso</FormLabel>
              <div className="text-sm text-muted-foreground">
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
          name={`mercancias.${index}.cve_material_peligroso`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clave Material Peligroso *</FormLabel>
              <FormControl>
                <CatalogoSelector
                  items={materiales}
                  loading={loadingMateriales}
                  placeholder="Buscar material peligroso..."
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearchChange={setMaterialSearch}
                  searchValue={materialSearch}
                  allowManualInput={true}
                  manualInputPlaceholder="Escribir clave manualmente"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
