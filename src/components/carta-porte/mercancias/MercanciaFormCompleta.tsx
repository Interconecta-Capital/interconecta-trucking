
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, Trash2, Save, X, Ruler, Globe } from 'lucide-react';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { AIAssistantButton } from './AIAssistantButton';
import { useAdaptedCatalogQuery } from '@/components/catalogos/hooks/useAdaptedCatalogQuery';
import { useFraccionesArancelarias } from '@/hooks/useCatalogosExtendidos';
import { MercanciaCompleta } from '@/types/cartaPorte';

interface MercanciaFormCompletaProps {
  index: number;
  onRemove?: () => void;
  mercancia?: MercanciaCompleta;
  onSave?: (mercancia: MercanciaCompleta) => Promise<boolean> | boolean;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MercanciaFormCompleta({ 
  index, 
  onRemove, 
  mercancia, 
  onSave, 
  onCancel, 
  isLoading 
}: MercanciaFormCompletaProps) {
  const form = useForm<MercanciaCompleta>({
    defaultValues: mercancia || {
      id: `mercancia-${Date.now()}`,
      descripcion: '',
      bienes_transp: '',
      clave_unidad: '',
      cantidad: 0,
      peso_kg: 0,
      valor_mercancia: 0,
      material_peligroso: false,
      cve_material_peligroso: '',
      moneda: 'MXN',
      fraccion_arancelaria: '',
      tipo_embalaje: '',
      material_embalaje: '',
      peso_bruto_total: 0,
      unidad_peso_bruto: 'KGM',
      dimensiones: {
        largo: 0,
        ancho: 0,
        alto: 0,
        unidad: 'CM'
      }
    }
  });
  
  const [productoSearch, setProductoSearch] = React.useState('');
  const [unidadSearch, setUnidadSearch] = React.useState('');
  const [materialSearch, setMaterialSearch] = React.useState('');
  const [embalajeSearch, setEmbalajeSearch] = React.useState('');
  const [fraccionSearch, setFraccionSearch] = React.useState('');
  
  const materialPeligroso = form.watch('material_peligroso') || false;
  const esComercioExterior = form.watch('fraccion_arancelaria') !== '';
  
  const { data: productos = [], isLoading: loadingProductos } = useAdaptedCatalogQuery(
    'productos',
    productoSearch,
    productoSearch.length >= 2
  );
  
  const { data: unidades = [], isLoading: loadingUnidades } = useAdaptedCatalogQuery(
    'unidades',
    unidadSearch,
    unidadSearch.length >= 2
  );
  
  const { data: materiales = [], isLoading: loadingMateriales } = useAdaptedCatalogQuery(
    'materiales_peligrosos',
    materialSearch,
    materialPeligroso && materialSearch.length >= 2
  );

  const { data: embalajes = [], isLoading: loadingEmbalajes } = useAdaptedCatalogQuery('embalajes', '', true);

  const { data: fracciones = [], isLoading: loadingFracciones } = useFraccionesArancelarias(
    fraccionSearch,
    fraccionSearch.length >= 2
  );

  const handleAISuggestion = (suggestion: any) => {
    if (suggestion.data) {
      Object.entries(suggestion.data).forEach(([key, value]) => {
        if (key === 'dimensiones' && typeof value === 'object') {
          form.setValue('dimensiones', value as any);
        } else if (typeof value === 'string') {
          form.setValue(key as keyof MercanciaCompleta, value);
        } else if (typeof value === 'number') {
          form.setValue(key as keyof MercanciaCompleta, value);
        } else if (typeof value === 'boolean') {
          form.setValue(key as keyof MercanciaCompleta, value);
        }
      });
    }
  };

  const handleSave = async (data: MercanciaCompleta) => {
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
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mercancía {index + 1}
            </CardTitle>
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
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Información Básica de la Mercancía
              </h4>
              
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de la Mercancía *</FormLabel>
                    <FormControl>
                      <Input placeholder="Descripción detallada de la mercancía" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bienes_transp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clave Producto/Servicio SAT *</FormLabel>
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
                  name="clave_unidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clave Unidad SAT *</FormLabel>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cantidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          step="0.001"
                          min="0.001"
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
                  name="peso_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          step="0.001"
                          min="0"
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
                  name="valor_mercancia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Comercio Exterior */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Comercio Exterior (Opcional)
              </h4>

              <FormField
                control={form.control}
                name="fraccion_arancelaria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fracción Arancelaria</FormLabel>
                    <FormControl>
                      <CatalogoSelector
                        items={fracciones}
                        loading={loadingFracciones}
                        placeholder="Buscar fracción arancelaria..."
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        onSearchChange={setFraccionSearch}
                        searchValue={fraccionSearch}
                        allowManualInput={true}
                        manualInputPlaceholder="Escribir fracción manualmente"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {esComercioExterior && (
                <FormField
                  control={form.control}
                  name="uuid_comercio_ext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UUID Comercio Exterior</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="UUID del complemento de comercio exterior"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator />

            {/* Embalaje */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Información de Embalaje
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo_embalaje"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Embalaje</FormLabel>
                      <FormControl>
                        <CatalogoSelector
                          items={embalajes}
                          loading={loadingEmbalajes}
                          placeholder="Buscar tipo de embalaje..."
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          onSearchChange={setEmbalajeSearch}
                          searchValue={embalajeSearch}
                          allowManualInput={true}
                          manualInputPlaceholder="Escribir tipo manualmente"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="material_embalaje"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material del Embalaje</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Cartón, Plástico, Madera"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="peso_bruto_total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso Bruto Total (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          step="0.001"
                          min="0"
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
                  name="unidad_peso_bruto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad Peso Bruto</FormLabel>
                      <FormControl>
                        <CatalogoSelector
                          items={unidades}
                          loading={loadingUnidades}
                          placeholder="Buscar unidad..."
                          value={field.value || 'KGM'}
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
            </div>

            <Separator />

            {/* Dimensiones */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Dimensiones del Embalaje
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="dimensiones.largo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          step="0.01"
                          min="0"
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
                  name="dimensiones.ancho"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ancho</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          step="0.01"
                          min="0"
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
                  name="dimensiones.alto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alto</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          step="0.01"
                          min="0"
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
                  name="dimensiones.unidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad</FormLabel>
                      <FormControl>
                        <CatalogoSelector
                          items={[
                            { value: 'CM', label: 'CM - Centímetros' },
                            { value: 'M', label: 'M - Metros' },
                            { value: 'IN', label: 'IN - Pulgadas' },
                            { value: 'FT', label: 'FT - Pies' }
                          ]}
                          placeholder="Unidad"
                          value={field.value || 'CM'}
                          onValueChange={field.onChange}
                          allowManualInput={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Material Peligroso */}
            <FormField
              control={form.control}
              name="material_peligroso"
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
                name="cve_material_peligroso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clave Material Peligroso *</FormLabel>
                    <FormControl>
                      <CatalogoSelector
                        items={materiales}
                        loading={loadingMateriales}
                        placeholder="Buscar material peligroso..."
                        value={field.value || ''}
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

            {/* Botones de acción */}
            <div className="flex justify-end gap-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
