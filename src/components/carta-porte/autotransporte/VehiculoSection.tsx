
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { AIAssistantButton } from '../mercancias/AIAssistantButton';
import { useConfiguracionesVehiculo, useTiposPermiso } from '@/hooks/useCatalogos';
import { useFormContext } from 'react-hook-form';

export function VehiculoSection() {
  const form = useFormContext();
  
  const [configSearch, setConfigSearch] = React.useState('');
  const [permisoSearch, setPermisoSearch] = React.useState('');
  
  const { data: configuraciones = [], isLoading: loadingConfig } = useConfiguracionesVehiculo(configSearch);
  const { data: permisos = [], isLoading: loadingPermisos } = useTiposPermiso(permisoSearch);

  const handleAISuggestion = (suggestion: any) => {
    if (suggestion.data) {
      // Apply AI suggestion to autotransporte form
      Object.entries(suggestion.data).forEach(([key, value]) => {
        if (key === 'config_vehicular' || key === 'perm_sct' || key === 'num_permiso_sct' ||
            key === 'placa_vm' || key === 'anio_modelo_vm') {
          form.setValue(`autotransporte.${key}`, value);
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Información del Vehículo</h3>
        <AIAssistantButton 
          context="autotransporte"
          onSuggestionApply={handleAISuggestion}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="autotransporte.placa_vm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa del Vehículo *</FormLabel>
              <FormControl>
                <Input placeholder="ABC-123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autotransporte.anio_modelo_vm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Año Modelo *</FormLabel>
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
        name="autotransporte.config_vehicular"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Configuración Vehicular *</FormLabel>
            <FormControl>
              <CatalogoSelector
                items={configuraciones}
                loading={loadingConfig}
                placeholder="Seleccionar configuración vehicular..."
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

      <div className="space-y-4">
        <h4 className="font-medium">Permisos y Seguros</h4>
        
        <FormField
          control={form.control}
          name="autotransporte.perm_sct"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Permiso SCT *</FormLabel>
              <FormControl>
                <CatalogoSelector
                  items={permisos}
                  loading={loadingPermisos}
                  placeholder="Seleccionar tipo de permiso..."
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
          name="autotransporte.num_permiso_sct"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="autotransporte.asegura_resp_civil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aseguradora Responsabilidad Civil *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la aseguradora" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autotransporte.poliza_resp_civil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Póliza Responsabilidad Civil *</FormLabel>
                <FormControl>
                  <Input placeholder="Número de póliza" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
