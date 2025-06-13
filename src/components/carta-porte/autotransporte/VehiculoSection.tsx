
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { AIAssistantButton } from '../mercancias/AIAssistantButton';
import { useConfiguracionesVehiculo, useTiposPermiso } from '@/hooks/useCatalogos';
import { Truck } from 'lucide-react';
import { AutotransporteData } from '@/hooks/useAutotransporte';

interface VehiculoSectionProps {
  data: AutotransporteData;
  onChange: (data: Partial<AutotransporteData>) => void;
}

export function VehiculoSection({ data, onChange }: VehiculoSectionProps) {
  const [configSearch, setConfigSearch] = React.useState('');
  const [permisoSearch, setPermisoSearch] = React.useState('');
  
  const { data: configuraciones = [], isLoading: loadingConfigs } = useConfiguracionesVehiculo(
    configSearch
  );
  
  const { data: permisos = [], isLoading: loadingPermisos } = useTiposPermiso(
    permisoSearch
  );

  const handleFieldChange = <K extends keyof AutotransporteData>(
    field: K, 
    value: AutotransporteData[K]
  ) => {
    onChange({ [field]: value });
  };

  const handleAISuggestion = (suggestion: any) => {
    if (suggestion.data) {
      // Apply AI suggestion to form with proper type checking
      const updates: Partial<AutotransporteData> = {};
      
      if (suggestion.data.placa_vm && typeof suggestion.data.placa_vm === 'string') {
        updates.placa_vm = suggestion.data.placa_vm;
      }
      if (suggestion.data.anio_modelo_vm && typeof suggestion.data.anio_modelo_vm === 'number') {
        updates.anio_modelo_vm = suggestion.data.anio_modelo_vm;
      }
      if (suggestion.data.config_vehicular && typeof suggestion.data.config_vehicular === 'string') {
        updates.config_vehicular = suggestion.data.config_vehicular;
      }
      if (suggestion.data.perm_sct && typeof suggestion.data.perm_sct === 'string') {
        updates.perm_sct = suggestion.data.perm_sct;
      }
      if (suggestion.data.num_permiso_sct && typeof suggestion.data.num_permiso_sct === 'string') {
        updates.num_permiso_sct = suggestion.data.num_permiso_sct;
      }
      
      onChange(updates);
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
            context="autotransporte"
            onSuggestionApply={handleAISuggestion}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="placa_vm">Placa del Vehículo *</Label>
            <Input 
              id="placa_vm"
              placeholder="ABC-123-D" 
              value={data.placa_vm || ''}
              onChange={(e) => handleFieldChange('placa_vm', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anio_modelo_vm">Año del Modelo *</Label>
            <Input 
              id="anio_modelo_vm"
              type="number" 
              placeholder="2023"
              value={data.anio_modelo_vm || ''}
              onChange={(e) => {
                const value = e.target.value;
                const numericValue = value === '' ? 0 : parseInt(value) || 0;
                handleFieldChange('anio_modelo_vm', numericValue);
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Configuración Vehicular *</Label>
          <CatalogoSelector
            items={configuraciones}
            loading={loadingConfigs}
            placeholder="Buscar configuración vehicular..."
            value={data.config_vehicular || ''}
            onValueChange={(value) => handleFieldChange('config_vehicular', value)}
            onSearchChange={setConfigSearch}
            searchValue={configSearch}
            allowManualInput={true}
            manualInputPlaceholder="Escribir configuración manualmente"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de Permiso SCT *</Label>
            <CatalogoSelector
              items={permisos}
              loading={loadingPermisos}
              placeholder="Buscar tipo de permiso..."
              value={data.perm_sct || ''}
              onValueChange={(value) => handleFieldChange('perm_sct', value)}
              onSearchChange={setPermisoSearch}
              searchValue={permisoSearch}
              allowManualInput={true}
              manualInputPlaceholder="Escribir permiso manualmente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_permiso_sct">Número de Permiso SCT *</Label>
            <Input 
              id="num_permiso_sct"
              placeholder="Número de permiso" 
              value={data.num_permiso_sct || ''}
              onChange={(e) => handleFieldChange('num_permiso_sct', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
