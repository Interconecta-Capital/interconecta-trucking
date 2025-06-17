
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVehiculos } from '@/hooks/useVehiculos';
import { VehiculoFormDialog } from '@/components/vehiculos/VehiculoFormDialog';
import { Truck, Plus, Search, CheckCircle } from 'lucide-react';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface VehiculoSelectorSimplificadoProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
}

export function VehiculoSelectorSimplificado({ data, onChange }: VehiculoSelectorSimplificadoProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  
  const { vehiculos, loading } = useVehiculos();

  const filteredVehiculos = vehiculos.filter(vehiculo => 
    vehiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedVehicle = vehiculos.find(v => v.id === selectedVehicleId);

  const handleVehiculoSelect = (vehiculoId: string) => {
    const vehiculo = vehiculos.find(v => v.id === vehiculoId);
    if (vehiculo) {
      setSelectedVehicleId(vehiculoId);
      onChange({
        ...data,
        placa_vm: vehiculo.placa || '',
        anio_modelo_vm: vehiculo.anio || new Date().getFullYear(),
        config_vehicular: vehiculo.config_vehicular || '',
        perm_sct: vehiculo.perm_sct || '',
        num_permiso_sct: vehiculo.num_permiso_sct || '',
        asegura_resp_civil: vehiculo.asegura_resp_civil || '',
        poliza_resp_civil: vehiculo.poliza_resp_civil || vehiculo.poliza_seguro || '',
        asegura_med_ambiente: vehiculo.asegura_med_ambiente || '',
        poliza_med_ambiente: vehiculo.poliza_med_ambiente || ''
      });
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  if (selectedVehicle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" />
              Vehículo Seleccionado
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedVehicleId('');
                onChange({
                  ...data,
                  placa_vm: '',
                  anio_modelo_vm: new Date().getFullYear(),
                  config_vehicular: '',
                  perm_sct: '',
                  num_permiso_sct: '',
                  asegura_resp_civil: '',
                  poliza_resp_civil: '',
                  asegura_med_ambiente: '',
                  poliza_med_ambiente: ''
                });
              }}
            >
              Cambiar Vehículo
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Información del Vehículo</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Placa:</span>
                <span className="ml-2 font-mono">{selectedVehicle.placa}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Año:</span>
                <span className="ml-2">{selectedVehicle.anio}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Marca/Modelo:</span>
                <span className="ml-2">{selectedVehicle.marca} {selectedVehicle.modelo}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Configuración:</span>
                <span className="ml-2">{selectedVehicle.config_vehicular || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Permiso SCT:</span>
                <span className="ml-2">{selectedVehicle.num_permiso_sct || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Seguro:</span>
                <span className="ml-2">{selectedVehicle.asegura_resp_civil || 'N/A'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-500" />
          Seleccionar Vehículo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por placa, marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Nuevo
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-4">Cargando vehículos...</div>
        ) : filteredVehiculos.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No se encontraron vehículos' : 'No hay vehículos registrados'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Vehículo
            </Button>
          </div>
        ) : (
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {filteredVehiculos.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className="p-3 border rounded-lg cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50"
                onClick={() => handleVehiculoSelect(vehiculo.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {vehiculo.placa}
                      {vehiculo.marca && vehiculo.modelo && (
                        <span className="text-gray-500 ml-2 font-normal">
                          {vehiculo.marca} {vehiculo.modelo}
                        </span>
                      )}
                    </div>
                    {vehiculo.anio && (
                      <div className="text-xs text-gray-500">Año: {vehiculo.anio}</div>
                    )}
                  </div>
                  <Badge variant={vehiculo.estado === 'disponible' ? 'default' : 'secondary'}>
                    {vehiculo.estado}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <VehiculoFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleCreateSuccess}
        />
      </CardContent>
    </Card>
  );
}
