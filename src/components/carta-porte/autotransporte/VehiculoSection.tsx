
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
      // Apply AI suggestion to form
      const updates: Partial<AutotransporteData> = {};
      Object.entries(suggestion.data).forEach(([key, value]) => {
        if (key === 'placa_vm' || key === 'anio_modelo_vm' || key === 'config_vehicular' || 
            key === 'perm_sct' || key === 'num_permiso_sct') {
          updates[key as keyof AutotransporteData] = value as any;
        }
      });
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
              onChange={(e) => handleFieldChange('anio_modelo_vm', parseInt(e.target.value) || '')}
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
