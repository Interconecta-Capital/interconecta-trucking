
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { AIAssistantButton } from '../mercancias/AIAssistantButton';
import { useBuscarConfigVehicular, useBuscarTipoPermiso } from '@/hooks/useCatalogos';
import { useFormContext } from 'react-hook-form';
import { Truck } from 'lucide-react';

export function VehiculoSection() {
  const form = useFormContext();
  
  const [configSearch, setConfigSearch] = React.useState('');
  const [permisoSearch, setPermisoSearch] = React.useState('');
  
  const { data: configuraciones = [], isLoading: loadingConfigs } = useBuscarConfigVehicular(
    configSearch,
    true
  );
  
  const { data: permisos = [], isLoading: loadingPermisos } = useBuscarTipoPermiso(
    permisoSearch,
    true
  );

  const handleAISuggestion = (suggestion: any) => {
    if (suggestion.data) {
      // Apply AI suggestion to form
      Object.entries(suggestion.data).forEach(([key, value]) => {
        if (key === 'placa_vm' || key === 'anio_modelo_vm' || key === 'config_vehicular' || 
            key === 'perm_sct' || key === 'num_permiso_sct') {
          form.setValue(key, value);
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>Vehículo Motor</span>
          </CardTitle>
          <AIAssistantButton 
            context="vehiculo"
            onSuggestionApply={handleAISuggestion}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="placa_vm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa del Vehículo *</FormLabel>
                <FormControl>
                  <Input placeholder="ABC-123-D" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="anio_modelo_vm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año del Modelo *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="2023"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="config_vehicular"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Configuración Vehicular *</FormLabel>
              <FormControl>
                <CatalogoSelector
                  items={configuraciones}
                  loading={loadingConfigs}
                  placeholder="Buscar configuración vehicular..."
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearchChange={setConfigSearch}
                  searchValue={configSearch}
                  allowManualInput={true}
                  manualInputPlaceholder="Escribir configuración manualmente"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="perm_sct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Permiso SCT *</FormLabel>
                <FormControl>
                  <CatalogoSelector
                    items={permisos}
                    loading={loadingPermisos}
                    placeholder="Buscar tipo de permiso..."
                    value={field.value}
                    onValueChange={field.onChange}
                    onSearchChange={setPermisoSearch}
                    searchValue={permisoSearch}
                    allowManualInput={true}
                    manualInputPlaceholder="Escribir permiso manualmente"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="num_permiso_sct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Permiso SCT *</FormLabel>
                <FormControl>
                  <Input placeholder="Número de permiso" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
