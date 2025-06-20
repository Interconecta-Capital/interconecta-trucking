
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, User, Search, AlertTriangle, CheckCircle, Scale, Clock } from 'lucide-react';
import { useStableVehiculos } from '@/hooks/useStableVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleRouteCalculation } from '@/hooks/useGoogleRouteCalculation.tsx';
import { ViajeWizardData } from '../ViajeWizard';
import { ContextualAlert } from '@/components/ui/contextual-alert';

interface ViajeWizardActivosProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
}

interface ValidationAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  dismissible: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ViajeWizardActivos({ data, updateData }: ViajeWizardActivosProps) {
  const { user } = useAuth();
  const { vehiculos, loading: loadingVehiculos } = useStableVehiculos(user?.id);
  const { conductores, loading: loadingConductores } = useConductores();
  const { validateWeightCapacity } = useGoogleRouteCalculation();
  const [searchVehiculo, setSearchVehiculo] = useState('');
  const [searchConductor, setSearchConductor] = useState('');
  const [validationAlerts, setValidationAlerts] = useState<ValidationAlert[]>([]);

  // Extraer peso de la mercancía desde la descripción
  const extractPesoFromDescription = (descripcion: string): number | null => {
    if (!descripcion) return null;
    
    const pesoMatch = descripcion.match(/(\d+)\s*(ton|toneladas|kg|kilogramos)/i);
    if (pesoMatch) {
      const cantidad = parseInt(pesoMatch[1]);
      const unidad = pesoMatch[2].toLowerCase();
      return unidad.includes('ton') ? cantidad * 1000 : cantidad;
    }
    return null;
  };

  // Validaciones en tiempo real
  useEffect(() => {
    const alerts: ValidationAlert[] = [];
    
    // Validación peso vs capacidad
    if (data.vehiculo && data.descripcionMercancia) {
      const pesoMercancia = extractPesoFromDescription(data.descripcionMercancia);
      if (pesoMercancia && data.vehiculo.capacidad_carga) {
        const validation = validateWeightCapacity(pesoMercancia, data.vehiculo.capacidad_carga);
        
        if (!validation.isValid) {
          alerts.push({
            id: 'peso-capacidad-critico',
            type: 'error',
            title: 'Sobrecarga Detectada',
            message: validation.warning || 'El peso excede la capacidad del vehículo',
            dismissible: false,
            action: {
              label: 'Ver Vehículos Alternativos',
              onClick: () => setSearchVehiculo('capacidad_mayor')
            }
          });
        } else if (validation.warning) {
          alerts.push({
            id: 'peso-capacidad-warning',
            type: 'warning',
            title: 'Carga Cercana al Límite',
            message: validation.warning,
            dismissible: true
          });
        }
      }
    }

    // Validación conductor
    if (data.conductor) {
      const conductorAlertas = getConductorAlertas(data.conductor);
      conductorAlertas.forEach((alerta, index) => {
        alerts.push({
          id: `conductor-${index}`,
          type: alerta.includes('vence') ? 'warning' : 'info',
          title: 'Documentación del Conductor',
          message: alerta,
          dismissible: true
        });
      });
    }

    // Validación vehículo
    if (data.vehiculo) {
      const vehiculoAlertas = getVehiculoAlertas(data.vehiculo);
      vehiculoAlertas.forEach((alerta, index) => {
        alerts.push({
          id: `vehiculo-${index}`,
          type: alerta.includes('vence') ? 'warning' : 'info',
          title: 'Documentación del Vehículo',
          message: alerta,
          dismissible: true
        });
      });
    }

    setValidationAlerts(alerts);
  }, [data.vehiculo, data.conductor, data.descripcionMercancia, validateWeightCapacity]);

  // Filtrar vehículos disponibles
  const vehiculosDisponibles = vehiculos.filter(vehiculo => {
    const matchesSearch = vehiculo.estado === 'disponible' &&
      (vehiculo.placa?.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
       vehiculo.marca?.toLowerCase().includes(searchVehiculo.toLowerCase()));
    
    // Si hay peso de mercancía, priorizar vehículos con capacidad suficiente
    if (searchVehiculo === 'capacidad_mayor' && data.descripcionMercancia) {
      const pesoMercancia = extractPesoFromDescription(data.descripcionMercancia);
      if (pesoMercancia && vehiculo.capacidad_carga) {
        return vehiculo.capacidad_carga >= pesoMercancia;
      }
    }
    
    return matchesSearch;
  });

  // Filtrar conductores disponibles
  const conductoresDisponibles = conductores.filter(conductor =>
    conductor.estado === 'disponible' &&
    (conductor.nombre.toLowerCase().includes(searchConductor.toLowerCase()) ||
     conductor.rfc?.toLowerCase().includes(searchConductor.toLowerCase()))
  );

  // Validaciones inteligentes
  const getVehiculoAlertas = (vehiculo: any) => {
    const alertas = [];
    
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

  const dismissAlert = (alertId: string) => {
    setValidationAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="space-y-6">
      {/* Sistema de Alertas Contextuales */}
      {validationAlerts.length > 0 && (
        <div className="space-y-3">
          {validationAlerts.map((alert) => (
            <ContextualAlert
              key={alert.id}
              type={alert.type}
              title={alert.title}
              message={alert.message}
              action={alert.action}
              dismissible={alert.dismissible}
              onDismiss={alert.dismissible ? () => dismissAlert(alert.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Sección Vehículo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5" />
            Seleccionar Vehículo
            {data.vehiculo && data.descripcionMercancia && (
              <div className="ml-auto">
                {(() => {
                  const peso = extractPesoFromDescription(data.descripcionMercancia);
                  if (peso && data.vehiculo.capacidad_carga) {
                    const validation = validateWeightCapacity(peso, data.vehiculo.capacidad_carga);
                    return validation.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    );
                  }
                  return null;
                })()}
              </div>
            )}
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
              
              {(searchVehiculo || searchVehiculo === 'capacidad_mayor') && (
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {loadingVehiculos ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Buscando vehículos...
                    </div>
                  ) : vehiculosDisponibles.length > 0 ? (
                    vehiculosDisponibles.map((vehiculo) => {
                      const alertas = getVehiculoAlertas(vehiculo);
                      const pesoMercancia = data.descripcionMercancia ? extractPesoFromDescription(data.descripcionMercancia) : null;
                      const isRecommended = pesoMercancia && vehiculo.capacidad_carga && 
                        pesoMercancia <= vehiculo.capacidad_carga * 0.8;
                      
                      return (
                        <button
                          key={vehiculo.id}
                          onClick={() => handleVehiculoSelect(vehiculo)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
                                {isRecommended && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800">
                                    <Scale className="h-3 w-3 mr-1" />
                                    Recomendado
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Capacidad: {vehiculo.capacidad_carga} kg
                                {pesoMercancia && vehiculo.capacidad_carga && (
                                  <span className="ml-2">
                                    ({Math.round((pesoMercancia / vehiculo.capacidad_carga) * 100)}% utilización)
                                  </span>
                                )}
                              </div>
                              {alertas.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3 text-amber-500" />
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
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    Capacidad: {data.vehiculo.capacidad_carga} kg
                    {(() => {
                      const peso = data.descripcionMercancia ? extractPesoFromDescription(data.descripcionMercancia) : null;
                      if (peso && data.vehiculo.capacidad_carga) {
                        const porcentaje = Math.round((peso / data.vehiculo.capacidad_carga) * 100);
                        return (
                          <Badge 
                            variant="outline" 
                            className={porcentaje > 100 ? 'bg-red-100 text-red-800' : 
                                     porcentaje > 90 ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-green-100 text-green-800'}
                          >
                            {porcentaje}% utilización
                          </Badge>
                        );
                      }
                      return null;
                    })()}
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
                                  <Clock className="h-3 w-3 text-amber-500" />
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
              {validationAlerts.length === 0 && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Sin Alertas
                </Badge>
              )}
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
