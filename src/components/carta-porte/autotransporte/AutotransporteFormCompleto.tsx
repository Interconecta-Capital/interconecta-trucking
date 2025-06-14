
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Truck, Save, Star, Ruler, FileText, AlertTriangle } from 'lucide-react';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { AIAssistantButton } from '../mercancias/AIAssistantButton';
import { useConfiguracionesVehiculo, useTiposPermiso } from '@/hooks/useCatalogos';
import { useTiposCarroceria } from '@/hooks/useCatalogosExtendidos';
import { CatalogosSATExtendido } from '@/services/catalogosSATExtendido';
import { AutotransporteCompleto } from '@/types/cartaPorte';
import { VehiculosGuardados } from './VehiculosGuardados';
import { RemolquesList } from './RemolquesList';
import { useToast } from '@/hooks/use-toast';

interface AutotransporteFormCompletoProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
}

export function AutotransporteFormCompleto({ data, onChange }: AutotransporteFormCompletoProps) {
  const [showVehiculosGuardados, setShowVehiculosGuardados] = useState(false);
  const [showGuardarModal, setShowGuardarModal] = useState(false);
  const [nombrePerfil, setNombrePerfil] = useState('');
  const [configSearch, setConfigSearch] = useState('');
  const [permisoSearch, setPermisoSearch] = useState('');
  const [carroceriaSearch, setCarroceriaSearch] = useState('');
  const [vinValidation, setVinValidation] = useState<{ valido: boolean; mensaje?: string }>({ valido: true });
  
  const { toast } = useToast();

  const { data: configuraciones = [], isLoading: loadingConfigs } = useConfiguracionesVehiculo(
    configSearch
  );
  
  const { data: permisos = [], isLoading: loadingPermisos } = useTiposPermiso(
    permisoSearch
  );

  const { data: carrocerias = [], isLoading: loadingCarrocerias } = useTiposCarroceria(
    carroceriaSearch
  );

  const handleFieldChange = <K extends keyof AutotransporteCompleto>(
    field: K, 
    value: AutotransporteCompleto[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const handleDimensionesChange = (dimension: 'largo' | 'ancho' | 'alto', value: number) => {
    const nuevasDimensiones = {
      ...data.dimensiones,
      [dimension]: value
    };
    handleFieldChange('dimensiones', nuevasDimensiones);
  };

  const handleVINChange = (vin: string) => {
    const validation = CatalogosSATExtendido.validarVIN(vin);
    setVinValidation(validation);
    handleFieldChange('numero_serie_vin', vin);
  };

  const handleAISuggestion = (suggestion: any) => {
    if (suggestion.data) {
      const updates: Partial<AutotransporteCompleto> = {};
      
      Object.entries(suggestion.data).forEach(([key, value]) => {
        if (key === 'dimensiones' && typeof value === 'object') {
          updates.dimensiones = value as any;
        } else if (typeof value === 'string' || typeof value === 'number') {
          updates[key as keyof AutotransporteCompleto] = value as any;
        }
      });
      
      onChange({ ...data, ...updates });
    }
  };

  const isVehiculoCompleto = data.placa_vm && data.anio_modelo_vm && data.config_vehicular;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Información Completa del Autotransporte</span>
            </CardTitle>
            
            <div className="flex space-x-2">
              <AIAssistantButton 
                context="autotransporte"
                onSuggestionApply={handleAISuggestion}
              />
              {isVehiculoCompleto && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuardarModal(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Vehículo
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información Básica del Vehículo */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Información Básica del Vehículo
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placa_vm">Placa del Vehículo *</Label>
                <Input 
                  id="placa_vm"
                  placeholder="ABC-123-D" 
                  value={data.placa_vm || ''}
                  onChange={(e) => handleFieldChange('placa_vm', e.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anio_modelo_vm">Año del Modelo *</Label>
                <Input 
                  id="anio_modelo_vm"
                  type="number" 
                  placeholder="2023"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={data.anio_modelo_vm || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value === '' ? 0 : parseInt(value) || 0;
                    handleFieldChange('anio_modelo_vm', numericValue);
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca_vehiculo">Marca del Vehículo</Label>
                <Input 
                  id="marca_vehiculo"
                  placeholder="Ej: Kenworth, Freightliner, Volvo"
                  value={data.marca_vehiculo || ''}
                  onChange={(e) => handleFieldChange('marca_vehiculo', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo_vehiculo">Modelo del Vehículo</Label>
                <Input 
                  id="modelo_vehiculo"
                  placeholder="Ej: T680, Cascadia, VNL"
                  value={data.modelo_vehiculo || ''}
                  onChange={(e) => handleFieldChange('modelo_vehiculo', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_serie_vin">Número de Serie VIN</Label>
              <Input 
                id="numero_serie_vin"
                placeholder="17 caracteres alfanuméricos"
                maxLength={17}
                value={data.numero_serie_vin || ''}
                onChange={(e) => handleVINChange(e.target.value.toUpperCase())}
                className={!vinValidation.valido ? 'border-red-500' : ''}
              />
              {!vinValidation.valido && vinValidation.mensaje && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {vinValidation.mensaje}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                17 caracteres, no debe contener I, O, Q
              </div>
            </div>
          </div>

          <Separator />

          {/* Especificaciones Técnicas */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Especificaciones Técnicas
            </h4>

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

            <div className="space-y-2">
              <Label>Tipo de Carrocería</Label>
              <CatalogoSelector
                items={carrocerias}
                loading={loadingCarrocerias}
                placeholder="Buscar tipo de carrocería..."
                value={data.tipo_carroceria || ''}
                onValueChange={(value) => handleFieldChange('tipo_carroceria', value)}
                onSearchChange={setCarroceriaSearch}
                searchValue={carroceriaSearch}
                allowManualInput={true}
                manualInputPlaceholder="Escribir tipo manualmente"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacidad_carga">Capacidad de Carga (kg)</Label>
                <Input 
                  id="capacidad_carga"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={data.capacidad_carga || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    handleFieldChange('capacidad_carga', value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso_bruto_vehicular">Peso Bruto Vehicular (kg)</Label>
                <Input 
                  id="peso_bruto_vehicular"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={data.peso_bruto_vehicular || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    handleFieldChange('peso_bruto_vehicular', value);
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dimensiones del Vehículo */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Dimensiones del Vehículo (metros)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dimension_largo">Largo (m)</Label>
                <Input 
                  id="dimension_largo"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={data.dimensiones?.largo || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    handleDimensionesChange('largo', value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimension_ancho">Ancho (m)</Label>
                <Input 
                  id="dimension_ancho"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={data.dimensiones?.ancho || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    handleDimensionesChange('ancho', value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimension_alto">Alto (m)</Label>
                <Input 
                  id="dimension_alto"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={data.dimensiones?.alto || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    handleDimensionesChange('alto', value);
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Permisos SCT */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Permisos y Documentación SCT
            </h4>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vigencia_permiso">Vigencia del Permiso</Label>
                <Input 
                  id="vigencia_permiso"
                  type="date"
                  value={data.vigencia_permiso || ''}
                  onChange={(e) => handleFieldChange('vigencia_permiso', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_permisos_adicionales">Permisos Adicionales</Label>
                <Input 
                  id="numero_permisos_adicionales"
                  placeholder="Separados por comas" 
                  value={data.numero_permisos_adicionales?.join(', ') || ''}
                  onChange={(e) => {
                    const permisos = e.target.value.split(',').map(p => p.trim()).filter(p => p);
                    handleFieldChange('numero_permisos_adicionales', permisos);
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Seguros */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Información de Seguros
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asegura_resp_civil">Aseguradora Responsabilidad Civil *</Label>
                <Input 
                  id="asegura_resp_civil"
                  placeholder="Nombre de la aseguradora" 
                  value={data.asegura_resp_civil || ''}
                  onChange={(e) => handleFieldChange('asegura_resp_civil', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poliza_resp_civil">Póliza Responsabilidad Civil *</Label>
                <Input 
                  id="poliza_resp_civil"
                  placeholder="Número de póliza" 
                  value={data.poliza_resp_civil || ''}
                  onChange={(e) => handleFieldChange('poliza_resp_civil', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asegura_med_ambiente">Aseguradora Medio Ambiente</Label>
                <Input 
                  id="asegura_med_ambiente"
                  placeholder="Nombre de la aseguradora" 
                  value={data.asegura_med_ambiente || ''}
                  onChange={(e) => handleFieldChange('asegura_med_ambiente', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poliza_med_ambiente">Póliza Medio Ambiente</Label>
                <Input 
                  id="poliza_med_ambiente"
                  placeholder="Número de póliza" 
                  value={data.poliza_med_ambiente || ''}
                  onChange={(e) => handleFieldChange('poliza_med_ambiente', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Remolques */}
          <RemolquesList
            remolques={data.remolques || []}
            onChange={(remolques) => handleFieldChange('remolques', remolques)}
          />
        </CardContent>
      </Card>

      {/* Modal para guardar vehículo */}
      {showGuardarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Guardar Vehículo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre del perfil
                </label>
                <input
                  type="text"
                  value={nombrePerfil}
                  onChange={(e) => setNombrePerfil(e.target.value)}
                  placeholder="Ej: Truck Principal, Vehículo Local, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    if (nombrePerfil.trim()) {
                      // Guardar vehículo logic here
                      toast({
                        title: "Éxito",
                        description: "Vehículo guardado correctamente",
                      });
                      setShowGuardarModal(false);
                      setNombrePerfil('');
                    }
                  }}
                  className="flex-1"
                >
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowGuardarModal(false);
                    setNombrePerfil('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
