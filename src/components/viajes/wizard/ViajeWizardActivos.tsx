
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, User, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStableVehiculos } from '@/hooks/useStableVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useAuth } from '@/hooks/useAuth';
import { ViajeWizardData } from '../ViajeWizard';

interface ViajeWizardActivosProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
}

export function ViajeWizardActivos({ data, updateData }: ViajeWizardActivosProps) {
  const { user } = useAuth();
  const { vehiculos, loading: loadingVehiculos } = useStableVehiculos(user?.id);
  const { conductores, loading: loadingConductores } = useConductores();
  const [searchVehiculo, setSearchVehiculo] = useState('');
  const [searchConductor, setSearchConductor] = useState('');

  // Filtrar vehículos disponibles
  const vehiculosDisponibles = vehiculos.filter(vehiculo =>
    vehiculo.estado === 'disponible' &&
    (vehiculo.placa?.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
     vehiculo.marca?.toLowerCase().includes(searchVehiculo.toLowerCase()))
  );

  // Filtrar conductores disponibles
  const conductoresDisponibles = conductores.filter(conductor =>
    conductor.estado === 'disponible' &&
    (conductor.nombre.toLowerCase().includes(searchConductor.toLowerCase()) ||
     conductor.rfc?.toLowerCase().includes(searchConductor.toLowerCase()))
  );

  // Validaciones inteligentes
  const getVehiculoAlertas = (vehiculo: any) => {
    const alertas = [];
    
    // Verificar capacidad vs mercancía (simulado)
    if (vehiculo.capacidad_carga && vehiculo.capacidad_carga < 1000) {
      alertas.push('Vehículo de carga ligera - Verificar compatibilidad con mercancía');
    }

    // Verificar seguros próximos a vencer
    if (vehiculo.vigencia_seguro) {
      const fechaVencimiento = new Date(vehiculo.vigencia_seguro);
      const diasRestantes = Math.floor((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (diasRestantes < 30) {
        alertas.push(`Seguro vence en ${diasRestantes} días`);
      }
    }

    return alertas;
  };

  const getConductorAlertas = (conductor: any) => {
    const alertas = [];
    
    // Verificar licencia próxima a vencer
    if (conductor.vigencia_licencia) {
      const fechaVencimiento = new Date(conductor.vigencia_licencia);
      const diasRestantes = Math.floor((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (diasRestantes < 30) {
        alertas.push(`Licencia vence en ${diasRestantes} días`);
      }
    }

    if (!conductor.operador_sct) {
      alertas.push('No está registrado como operador SCT');
    }

    return alertas;
  };

  const handleVehiculoSelect = (vehiculo: any) => {
    updateData({ vehiculo });
    setSearchVehiculo('');
  };

  const handleConductorSelect = (conductor: any) => {
    updateData({ conductor });
    setSearchConductor('');
  };

  return (
    <div className="space-y-6">
      {/* Sección Vehículo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5" />
            Seleccionar Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.vehiculo ? (
            <div className="space-y-3">
              <Label htmlFor="searchVehiculo">Buscar vehículo</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="searchVehiculo"
                  placeholder="Buscar por placa o marca..."
                  value={searchVehiculo}
                  onChange={(e) => setSearchVehiculo(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {searchVehiculo && (
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {loadingVehiculos ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Buscando vehículos...
                    </div>
                  ) : vehiculosDisponibles.length > 0 ? (
                    vehiculosDisponibles.map((vehiculo) => {
                      const alertas = getVehiculoAlertas(vehiculo);
                      return (
                        <button
                          key={vehiculo.id}
                          onClick={() => handleVehiculoSelect(vehiculo)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Capacidad: {vehiculo.capacidad_carga} kg
                              </div>
                              {alertas.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                                  <span className="text-xs text-amber-600">
                                    {alertas.length} alerta(s)
                                  </span>
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Disponible
                            </Badge>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No se encontraron vehículos disponibles
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <div className="font-medium">
                    {data.vehiculo.marca} {data.vehiculo.modelo} - {data.vehiculo.placa}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Capacidad: {data.vehiculo.capacidad_carga} kg
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateData({ vehiculo: undefined })}
                >
                  Cambiar
                </Button>
              </div>

              {/* Mostrar alertas del vehículo seleccionado */}
              {getVehiculoAlertas(data.vehiculo).map((alerta, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alerta}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección Conductor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Seleccionar Conductor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.conductor ? (
            <div className="space-y-3">
              <Label htmlFor="searchConductor">Buscar conductor</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="searchConductor"
                  placeholder="Buscar por nombre..."
                  value={searchConductor}
                  onChange={(e) => setSearchConductor(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {searchConductor && (
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {loadingConductores ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Buscando conductores...
                    </div>
                  ) : conductoresDisponibles.length > 0 ? (
                    conductoresDisponibles.map((conductor) => {
                      const alertas = getConductorAlertas(conductor);
                      return (
                        <button
                          key={conductor.id}
                          onClick={() => handleConductorSelect(conductor)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{conductor.nombre}</div>
                              <div className="text-sm text-muted-foreground">
                                Lic: {conductor.num_licencia || 'No registrada'}
                              </div>
                              {alertas.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                                  <span className="text-xs text-amber-600">
                                    {alertas.length} alerta(s)
                                  </span>
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Disponible
                            </Badge>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No se encontraron conductores disponibles
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <div className="font-medium">{data.conductor.nombre}</div>
                  <div className="text-sm text-muted-foreground">
                    Lic: {data.conductor.num_licencia || 'No registrada'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateData({ conductor: undefined })}
                >
                  Cambiar
                </Button>
              </div>

              {/* Mostrar alertas del conductor seleccionado */}
              {getConductorAlertas(data.conductor).map((alerta, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alerta}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de la sección */}
      {data.vehiculo && data.conductor && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activos Asignados
              </Badge>
            </div>
            <p className="text-sm text-green-800">
              Vehículo y conductor asignados correctamente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
