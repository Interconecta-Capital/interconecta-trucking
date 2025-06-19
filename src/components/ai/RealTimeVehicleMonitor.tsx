
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Truck, 
  Fuel, 
  Clock, 
  AlertTriangle, 
  Activity,
  Navigation,
  Thermometer,
  Battery
} from 'lucide-react';

interface VehicleStatus {
  id: string;
  placa: string;
  ubicacion: {
    lat: number;
    lng: number;
    direccion: string;
  };
  estado: 'en_ruta' | 'parado' | 'mantenimiento' | 'disponible';
  velocidad: number;
  combustible: number;
  temperatura_motor: number;
  presion_llantas: number[];
  conductor: string;
  ruta_asignada?: string;
  tiempo_conduccion: number;
  ultima_actualizacion: Date;
  alertas: Array<{
    tipo: string;
    mensaje: string;
    severidad: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export function RealTimeVehicleMonitor() {
  const [vehiculos, setVehiculos] = useState<VehicleStatus[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Simular datos de vehículos en tiempo real
  useEffect(() => {
    const mockVehicles: VehicleStatus[] = [
      {
        id: '1',
        placa: 'ABC-123-XYZ',
        ubicacion: {
          lat: 19.4326,
          lng: -99.1332,
          direccion: 'Av. Insurgentes Sur 1234, CDMX'
        },
        estado: 'en_ruta',
        velocidad: 65,
        combustible: 75,
        temperatura_motor: 85,
        presion_llantas: [32, 31, 33, 32],
        conductor: 'Juan Pérez',
        ruta_asignada: 'CDMX - Guadalajara',
        tiempo_conduccion: 180,
        ultima_actualizacion: new Date(),
        alertas: []
      },
      {
        id: '2',
        placa: 'DEF-456-ABC',
        ubicacion: {
          lat: 20.6597,
          lng: -103.3496,
          direccion: 'Av. López Mateos 567, Guadalajara'
        },
        estado: 'parado',
        velocidad: 0,
        combustible: 25,
        temperatura_motor: 70,
        presion_llantas: [30, 28, 31, 30],
        conductor: 'María González',
        tiempo_conduccion: 420,
        ultima_actualizacion: new Date(Date.now() - 5 * 60 * 1000),
        alertas: [
          {
            tipo: 'combustible_bajo',
            mensaje: 'Nivel de combustible bajo (25%)',
            severidad: 'medium'
          },
          {
            tipo: 'presion_llanta',
            mensaje: 'Presión baja en llanta trasera izquierda',
            severidad: 'medium'
          }
        ]
      }
    ];

    setVehiculos(mockVehicles);
    setLoading(false);

    // Simular actualizaciones en tiempo real
    const interval = setInterval(() => {
      setVehiculos(prev => prev.map(vehiculo => ({
        ...vehiculo,
        velocidad: vehiculo.estado === 'en_ruta' ? 
          Math.max(0, vehiculo.velocidad + (Math.random() - 0.5) * 10) : 0,
        combustible: Math.max(0, vehiculo.combustible - Math.random() * 0.5),
        temperatura_motor: vehiculo.temperatura_motor + (Math.random() - 0.5) * 5,
        tiempo_conduccion: vehiculo.estado === 'en_ruta' ? 
          vehiculo.tiempo_conduccion + 1 : vehiculo.tiempo_conduccion,
        ultima_actualizacion: new Date()
      })));
    }, 10000); // Actualizar cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const getEstadoColor = (estado: VehicleStatus['estado']) => {
    switch (estado) {
      case 'en_ruta': return 'bg-green-100 text-green-800';
      case 'parado': return 'bg-yellow-100 text-yellow-800';
      case 'mantenimiento': return 'bg-red-100 text-red-800';
      case 'disponible': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  const vehiculoSeleccionado = selectedVehicle ? 
    vehiculos.find(v => v.id === selectedVehicle) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="h-6 w-6 animate-spin mr-2" />
        Cargando monitoreo de vehículos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Monitoreo de Vehículos en Tiempo Real</h3>
        <Badge variant="outline">
          {vehiculos.filter(v => v.estado === 'en_ruta').length} en ruta
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Vehículos */}
        <div className="lg:col-span-1 space-y-3">
          {vehiculos.map((vehiculo) => (
            <Card 
              key={vehiculo.id} 
              className={`cursor-pointer transition-colors ${
                selectedVehicle === vehiculo.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedVehicle(vehiculo.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span className="font-medium">{vehiculo.placa}</span>
                  </div>
                  <Badge className={getEstadoColor(vehiculo.estado)}>
                    {vehiculo.estado.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{vehiculo.ubicacion.direccion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>👤 {vehiculo.conductor}</span>
                    <span>⛽ {vehiculo.combustible.toFixed(0)}%</span>
                  </div>
                </div>

                {vehiculo.alertas.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">
                      {vehiculo.alertas.length} alerta(s)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detalles del Vehículo Seleccionado */}
        <div className="lg:col-span-2">
          {vehiculoSeleccionado ? (
            <div className="space-y-4">
              {/* Header del Vehículo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      {vehiculoSeleccionado.placa}
                    </div>
                    <Badge className={getEstadoColor(vehiculoSeleccionado.estado)}>
                      {vehiculoSeleccionado.estado.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Navigation className="h-4 w-4 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold">{vehiculoSeleccionado.velocidad.toFixed(0)}</p>
                      <p className="text-sm text-muted-foreground">km/h</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Fuel className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold">{vehiculoSeleccionado.combustible.toFixed(0)}</p>
                      <p className="text-sm text-muted-foreground">% combustible</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                      </div>
                      <p className="text-2xl font-bold">{vehiculoSeleccionado.temperatura_motor.toFixed(0)}</p>
                      <p className="text-sm text-muted-foreground">°C motor</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="h-4 w-4 text-purple-500" />
                      </div>
                      <p className="text-2xl font-bold">{formatTiempo(vehiculoSeleccionado.tiempo_conduccion).split(' ')[0]}</p>
                      <p className="text-sm text-muted-foreground">tiempo activo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información de Ubicación */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Ubicación Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{vehiculoSeleccionado.ubicacion.direccion}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Lat: {vehiculoSeleccionado.ubicacion.lat.toFixed(6)}</span>
                      <span>Lng: {vehiculoSeleccionado.ubicacion.lng.toFixed(6)}</span>
                    </div>
                    {vehiculoSeleccionado.ruta_asignada && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          Ruta: {vehiculoSeleccionado.ruta_asignada}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Alertas Activas */}
              {vehiculoSeleccionado.alertas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-5 w-5" />
                      Alertas Activas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {vehiculoSeleccionado.alertas.map((alerta, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex items-center justify-between">
                              <span>{alerta.mensaje}</span>
                              <Badge variant={getSeverityColor(alerta.severidad)}>
                                {alerta.severidad}
                              </Badge>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Información Técnica */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Técnica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Presión de Llantas (PSI)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {vehiculoSeleccionado.presion_llantas.map((presion, index) => (
                          <div key={index} className="text-center p-2 border rounded">
                            <p className="text-lg font-bold">{presion}</p>
                            <p className="text-xs text-muted-foreground">
                              {['DI', 'DD', 'TI', 'TD'][index]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Última Actualización</p>
                      <p className="text-sm text-muted-foreground">
                        {vehiculoSeleccionado.ultima_actualizacion.toLocaleString()}
                      </p>
                      
                      <p className="text-sm font-medium mt-4 mb-2">Conductor Asignado</p>
                      <p className="text-sm">{vehiculoSeleccionado.conductor}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-4" />
                  <p>Selecciona un vehículo para ver los detalles</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
