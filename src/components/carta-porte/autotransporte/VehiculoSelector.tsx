
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVehiculos } from '@/hooks/useVehiculos';
import { VehiculoFormDialog } from '@/components/vehiculos/VehiculoFormDialog';
import { Truck, Plus, Search } from 'lucide-react';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface VehiculoSelectorProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
}

export function VehiculoSelector({ data, onChange }: VehiculoSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  
  const { vehiculos, loading } = useVehiculos();

  const filteredVehiculos = vehiculos.filter(vehiculo => 
    vehiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    // Los datos se actualizarán automáticamente cuando se refresque la lista de vehículos
  };

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
          <div className="text-center py-4 text-muted-foreground">
            {searchTerm ? 'No se encontraron vehículos' : 'No hay vehículos registrados'}
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredVehiculos.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedVehicleId === vehiculo.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleVehiculoSelect(vehiculo.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">
                      {vehiculo.placa}
                      {vehiculo.marca && vehiculo.modelo && (
                        <span className="text-gray-500 ml-2">
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

        {selectedVehicleId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm text-green-800">
              ✓ Vehículo seleccionado: {data.placa_vm}
            </div>
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
