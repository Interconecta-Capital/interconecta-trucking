import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Truck } from 'lucide-react';
import { useVehiculos } from '@/hooks/useVehiculos';
import { VehiculoFormDialog } from '@/components/vehiculos/VehiculoFormDialog';

interface AutotransporteSectionProps {
  data: any;
  onChange: (data: any) => void;
}

export function AutotransporteSection({ data, onChange }: AutotransporteSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  
  const { vehiculos, loading } = useVehiculos();

  const safeVehiculos = Array.isArray(vehiculos) ? vehiculos : [];

  const filteredVehiculos = safeVehiculos.filter(vehiculo => 
    vehiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo?.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo?.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVehiculoSelect = (vehiculoId: string) => {
    const vehiculo = safeVehiculos.find(v => v?.id === vehiculoId);
    if (vehiculo) {
      setSelectedVehicleId(vehiculoId);
      onChange({
        ...data,
        placa_vm: vehiculo.placa || '',
        anio_modelo_vm: vehiculo.anio || new Date().getFullYear(),
        config_vehicular: vehiculo.config_vehicular || '',
        // Use default values for fields not available in DB
        perm_sct: '',
        num_permiso_sct: '',
        asegura_resp_civil: '',
        poliza_resp_civil: vehiculo.poliza_seguro || '',
        asegura_med_ambiente: '',
        poliza_med_ambiente: '',
        peso_bruto_vehicular: 0,
        tipo_carroceria: ''
      });
      setShowVehicleSelector(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Selector de Vehículo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-500" />
            Seleccionar Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowVehicleSelector(!showVehicleSelector)}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Buscar Vehículo Registrado
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear Nuevo Vehículo
            </Button>
          </div>

          {showVehicleSelector && (
            <div className="space-y-4 border-t pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por placa, marca o modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loading ? (
                <div className="text-center py-4">Cargando vehículos...</div>
              ) : filteredVehiculos.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {searchTerm ? 'No se encontraron vehículos' : 'No hay vehículos registrados'}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredVehiculos.map((vehiculo) => (
                    <div
                      key={vehiculo?.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedVehicleId === vehiculo?.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleVehiculoSelect(vehiculo?.id || '')}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">
                            {vehiculo?.placa || 'Sin placa'}
                            {vehiculo?.marca && vehiculo?.modelo && (
                              <span className="text-gray-500 ml-2">
                                {vehiculo.marca} {vehiculo.modelo}
                              </span>
                            )}
                          </div>
                          {vehiculo?.anio && (
                            <div className="text-xs text-gray-500">Año: {vehiculo.anio}</div>
                          )}
                        </div>
                        <Badge variant={vehiculo?.estado === 'disponible' ? 'default' : 'secondary'}>
                          {vehiculo?.estado || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedVehicleId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800">
                ✓ Vehículo seleccionado: {data.placa_vm}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del Vehículo */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Vehículo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="placa_vm">Placa del Vehículo *</Label>
            <Input
              id="placa_vm"
              value={data?.placa_vm || ''}
              onChange={(e) => handleFieldChange('placa_vm', e.target.value)}
              placeholder="Placa del vehículo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anio_modelo_vm">Año del Modelo</Label>
            <Input
              id="anio_modelo_vm"
              type="number"
              value={data?.anio_modelo_vm || new Date().getFullYear()}
              onChange={(e) => handleFieldChange('anio_modelo_vm', parseInt(e.target.value))}
              placeholder="Año del modelo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
            <Select
              value={data?.config_vehicular || ''}
              onValueChange={(value) => handleFieldChange('config_vehicular', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar configuración" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C2">C2 - Camión Unitario (2 ejes)</SelectItem>
                <SelectItem value="C3">C3 - Camión Unitario (3 ejes)</SelectItem>
                <SelectItem value="T3S2">T3S2 - Tractocamión con Semirremolque</SelectItem>
                <SelectItem value="T3S3">T3S3 - Tractocamión con Semirremolque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo_carroceria">Tipo de Carrocería</Label>
            <Select
              value={data?.tipo_carroceria || ''}
              onValueChange={(value) => handleFieldChange('tipo_carroceria', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar carrocería" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">Caja cerrada</SelectItem>
                <SelectItem value="02">Caja abierta</SelectItem>
                <SelectItem value="03">Tanque</SelectItem>
                <SelectItem value="04">Plataforma</SelectItem>
                <SelectItem value="05">Tolva</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="peso_bruto_vehicular">Peso Bruto Vehicular (Kg)</Label>
            <Input
              id="peso_bruto_vehicular"
              type="number"
              value={data?.peso_bruto_vehicular || 0}
              onChange={(e) => handleFieldChange('peso_bruto_vehicular', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>
        </CardContent>
      </Card>

      {/* Permisos y Seguros */}
      <Card>
        <CardHeader>
          <CardTitle>Permisos y Seguros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="perm_sct">Permiso SCT</Label>
            <Select
              value={data?.perm_sct || ''}
              onValueChange={(value) => handleFieldChange('perm_sct', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar permiso SCT" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TPAF01">TPAF01 - Autotransporte Federal de Carga</SelectItem>
                <SelectItem value="TPAF02">TPAF02 - Transporte Privado</SelectItem>
                <SelectItem value="TPAF03">TPAF03 - Paquetería y Mensajería</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="num_permiso_sct">Número de Permiso SCT</Label>
            <Input
              id="num_permiso_sct"
              value={data?.num_permiso_sct || ''}
              onChange={(e) => handleFieldChange('num_permiso_sct', e.target.value)}
              placeholder="Número de permiso SCT"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asegura_resp_civil">Aseguradora Responsabilidad Civil</Label>
            <Input
              id="asegura_resp_civil"
              value={data?.asegura_resp_civil || ''}
              onChange={(e) => handleFieldChange('asegura_resp_civil', e.target.value)}
              placeholder="Aseguradora de responsabilidad civil"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="poliza_resp_civil">Póliza Responsabilidad Civil</Label>
            <Input
              id="poliza_resp_civil"
              value={data?.poliza_resp_civil || ''}
              onChange={(e) => handleFieldChange('poliza_resp_civil', e.target.value)}
              placeholder="Número de póliza"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asegura_med_ambiente">Aseguradora Medio Ambiente</Label>
            <Input
              id="asegura_med_ambiente"
              value={data?.asegura_med_ambiente || ''}
              onChange={(e) => handleFieldChange('asegura_med_ambiente', e.target.value)}
              placeholder="Aseguradora de medio ambiente"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="poliza_med_ambiente">Póliza Medio Ambiente</Label>
            <Input
              id="poliza_med_ambiente"
              value={data?.poliza_med_ambiente || ''}
              onChange={(e) => handleFieldChange('poliza_med_ambiente', e.target.value)}
              placeholder="Número de póliza medio ambiente"
            />
          </div>
        </CardContent>
      </Card>

      <VehiculoFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
