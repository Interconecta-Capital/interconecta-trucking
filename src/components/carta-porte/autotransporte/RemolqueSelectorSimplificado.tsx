
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVehiculos } from '@/hooks/useVehiculos';
import { VehiculoFormDialog } from '@/components/vehiculos/VehiculoFormDialog';
import { Truck, Plus, Search, X, CheckCircle } from 'lucide-react';

interface RemolqueSelectorSimplificadoProps {
  remolques: any[];
  onChange: (remolques: any[]) => void;
}

export function RemolqueSelectorSimplificado({ remolques, onChange }: RemolqueSelectorSimplificadoProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  
  const { vehiculos, loading } = useVehiculos();

  // Filtrar solo remolques/trailers
  const filteredRemolques = vehiculos.filter(vehiculo => 
    (vehiculo.tipo_vehiculo === 'remolque' || vehiculo.tipo_vehiculo === 'trailer') &&
    (vehiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     vehiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     vehiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRemolqueSelect = (vehiculo: any) => {
    const nuevoRemolque = {
      placa: vehiculo.placa || '',
      subtipo_rem: vehiculo.subtipo_rem || vehiculo.config_vehicular || ''
    };
    onChange([...remolques, nuevoRemolque]);
    setShowSelector(false);
    setSearchTerm('');
  };

  const handleRemoveRemolque = (index: number) => {
    const updatedRemolques = remolques.filter((_, i) => i !== index);
    onChange(updatedRemolques);
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-orange-500" />
            Remolques ({remolques.length})
          </div>
          {!showSelector && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSelector(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Remolque
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de remolques seleccionados */}
        {remolques.length > 0 && (
          <div className="space-y-2">
            {remolques.map((remolque, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="font-medium">{remolque.placa}</span>
                      {remolque.subtipo_rem && (
                        <span className="text-gray-500 ml-2 text-sm">({remolque.subtipo_rem})</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRemolque(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selector de remolques */}
        {showSelector && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Seleccionar Remolque</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSelector(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar remolques por placa, marca..."
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
              <div className="text-center py-4">Cargando remolques...</div>
            ) : filteredRemolques.length === 0 ? (
              <div className="text-center py-6">
                <Truck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm mb-3">
                  {searchTerm ? 'No se encontraron remolques' : 'No hay remolques registrados'}
                </p>
                <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Remolque
                </Button>
              </div>
            ) : (
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {filteredRemolques.map((vehiculo) => (
                  <div
                    key={vehiculo.id}
                    className="p-3 border rounded-lg cursor-pointer transition-all hover:border-orange-300 hover:bg-orange-50"
                    onClick={() => handleRemolqueSelect(vehiculo)}
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
                        {vehiculo.subtipo_rem && (
                          <div className="text-xs text-gray-500">Tipo: {vehiculo.subtipo_rem}</div>
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
