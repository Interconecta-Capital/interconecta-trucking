
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Save, Star } from 'lucide-react';
import { VehiculoSection } from './VehiculoSection';
import { SegurosSection } from './SegurosSection';
import { RemolquesList } from './RemolquesList';
import { VehiculosGuardados } from './VehiculosGuardados';
import { useAutotransporte, AutotransporteData } from '@/hooks/useAutotransporte';
import { useToast } from '@/hooks/use-toast';

interface AutotransporteFormProps {
  data: AutotransporteData;
  onChange: (data: AutotransporteData) => void;
}

export function AutotransporteForm({ data, onChange }: AutotransporteFormProps) {
  const [showVehiculosGuardados, setShowVehiculosGuardados] = useState(false);
  const [showGuardarModal, setShowGuardarModal] = useState(false);
  const [nombrePerfil, setNombrePerfil] = useState('');
  const { vehiculosGuardados, cargarVehiculosGuardados, guardarVehiculo } = useAutotransporte();
  const { toast } = useToast();

  useEffect(() => {
    cargarVehiculosGuardados();
  }, [cargarVehiculosGuardados]);

  const handleVehiculoChange = (vehiculoData: Partial<AutotransporteData>) => {
    onChange({
      ...data,
      ...vehiculoData,
    });
  };

  const handleCargarVehiculo = (vehiculo: any) => {
    onChange({
      placa_vm: vehiculo.placa_vm,
      anio_modelo_vm: vehiculo.anio_modelo_vm,
      config_vehicular: vehiculo.config_vehicular,
      perm_sct: vehiculo.seguros?.perm_sct || '',
      num_permiso_sct: vehiculo.seguros?.num_permiso_sct || '',
      asegura_resp_civil: vehiculo.seguros?.asegura_resp_civil || '',
      poliza_resp_civil: vehiculo.seguros?.poliza_resp_civil || '',
      asegura_med_ambiente: vehiculo.seguros?.asegura_med_ambiente || '',
      poliza_med_ambiente: vehiculo.seguros?.poliza_med_ambiente || '',
      remolques: vehiculo.remolques || [],
    });

    setShowVehiculosGuardados(false);
    toast({
      title: "Éxito",
      description: "Datos del vehículo cargados correctamente",
    });
  };

  const handleGuardarVehiculo = async () => {
    if (!nombrePerfil.trim()) {
      toast({
        title: "Error",
        description: "Ingrese un nombre para el perfil del vehículo",
        variant: "destructive",
      });
      return;
    }

    await guardarVehiculo(data, nombrePerfil);
    setShowGuardarModal(false);
    setNombrePerfil('');
  };

  const isVehiculoCompleto = data.placa_vm && data.anio_modelo_vm && data.config_vehicular;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Información del Autotransporte</span>
            </CardTitle>
            
            <div className="flex space-x-2">
              {vehiculosGuardados.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVehiculosGuardados(!showVehiculosGuardados)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Vehículos Guardados
                </Button>
              )}
              
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
          {showVehiculosGuardados && (
            <VehiculosGuardados
              vehiculos={vehiculosGuardados}
              onCargarVehiculo={handleCargarVehiculo}
              onCerrar={() => setShowVehiculosGuardados(false)}
            />
          )}

          <VehiculoSection 
            data={data}
            onChange={handleVehiculoChange}
          />

          <SegurosSection
            data={data}
            onChange={handleVehiculoChange}
          />

          <RemolquesList
            remolques={data.remolques || []}
            onChange={(remolques) => handleVehiculoChange({ remolques })}
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
                  onClick={handleGuardarVehiculo}
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
