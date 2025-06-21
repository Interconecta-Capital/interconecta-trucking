
import { ResponsiveCard, ResponsiveCardContent, ResponsiveCardHeader, ResponsiveCardTitle } from '@/components/ui/responsive-card';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Truck, 
  Package,
  User,
  Gauge,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { ViajeCompleto } from '@/hooks/useViajesCompletos';

interface TrackingViajeRealTimeProps {
  viaje: ViajeCompleto;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const TrackingViajeRealTime = ({ 
  viaje, 
  isFullscreen = false, 
  onToggleFullscreen 
}: TrackingViajeRealTimeProps) => {
  
  // Mock data para tracking en tiempo real
  const trackingData = {
    ubicacionActual: "Carretera México-Guadalajara, Km 47",
    coordenadas: { lat: 19.4326, lng: -99.1332 },
    velocidad: "78 km/h",
    ultimaActualizacion: new Date().toLocaleTimeString(),
    progreso: 42,
    tiempoEstimadoLlegada: "2024-06-21T18:30:00Z",
    distanciaRestante: "284 km"
  };

  const calcularPesoTotal = (mercancias: any[]) => {
    return mercancias?.reduce((total, m) => total + (m.peso_kg * m.cantidad || 0), 0) || 0;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Estado del tracking */}
      <ResponsiveCard className="border-green-200 bg-green-50">
        <ResponsiveCardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-semibold text-green-800">Tracking Activo</h3>
                <p className="text-sm text-green-700">
                  Última actualización: {trackingData.ultimaActualizacion}
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <Navigation className="h-3 w-3 mr-1" />
              En Tiempo Real
            </Badge>
          </div>
        </ResponsiveCardContent>
      </ResponsiveCard>

      {/* Información principal del viaje */}
      <ResponsiveGrid cols={{ default: 1, md: 2 }} gap={{ default: 4, md: 6 }}>
        <ResponsiveCard>
          <ResponsiveCardHeader>
            <ResponsiveCardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Ubicación y Ruta
            </ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-xs font-medium text-gray-60 uppercase">Origen</p>
                  <p className="font-medium text-gray-90">{viaje.origen}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-xs font-medium text-gray-60 uppercase">Ubicación Actual</p>
                  <p className="font-medium text-gray-90">{trackingData.ubicacionActual}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-xs font-medium text-gray-60 uppercase">Destino</p>
                  <p className="font-medium text-gray-90">{viaje.destino}</p>
                </div>
              </div>
            </div>

            {/* Progreso visual */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-70">Progreso del viaje</span>
                <span className="text-sm font-bold text-gray-90">{trackingData.progreso}%</span>
              </div>
              <Progress value={trackingData.progreso} className="h-3" />
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <ResponsiveCardHeader>
            <ResponsiveCardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-green-600" />
              Datos de Viaje
            </ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600 uppercase">Velocidad</span>
                </div>
                <p className="text-lg font-bold text-gray-90">{trackingData.velocidad}</p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600 uppercase">Restante</span>
                </div>
                <p className="text-lg font-bold text-gray-90">{trackingData.distanciaRestante}</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-xl col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600 uppercase">ETA</span>
                </div>
                <p className="text-sm font-bold text-gray-90">
                  {formatDateTime(trackingData.tiempoEstimadoLlegada)}
                </p>
              </div>
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* Información de carga transportada */}
      {viaje.mercancias && viaje.mercancias.length > 0 && (
        <ResponsiveCard>
          <ResponsiveCardHeader>
            <ResponsiveCardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Carga Transportada
            </ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent>
            <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap={{ default: 3, md: 4 }}>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-gray-90">{viaje.mercancias.length}</p>
                  <p className="text-sm text-gray-60">Tipos de Mercancía</p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-center">
                  <Gauge className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-gray-90">
                    {calcularPesoTotal(viaje.mercancias).toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-60">kg Total</p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-center">
                  <User className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-lg font-bold text-gray-90">
                    {viaje.cliente?.nombre || 'Sin cliente'}
                  </p>
                  <p className="text-sm text-gray-60">Cliente</p>
                </div>
              </div>
            </ResponsiveGrid>

            {/* Detalle de mercancías */}
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-gray-90">Detalle de Mercancías:</h4>
              {viaje.mercancias.slice(0, 3).map((mercancia, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-90">
                        {mercancia.descripcion || `Mercancía ${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-60">
                        Cantidad: {mercancia.cantidad} unidades
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-90">
                        {(mercancia.peso_kg * mercancia.cantidad).toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {viaje.mercancias.length > 3 && (
                <p className="text-sm text-gray-60 text-center">
                  ... y {viaje.mercancias.length - 3} más
                </p>
              )}
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      )}

      {/* Recursos asignados */}
      <ResponsiveCard>
        <ResponsiveCardHeader>
          <ResponsiveCardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Recursos Asignados
          </ResponsiveCardTitle>
        </ResponsiveCardHeader>
        <ResponsiveCardContent>
          <ResponsiveGrid cols={{ default: 1, md: 2 }} gap={{ default: 4, md: 6 }}>
            {viaje.vehiculo ? (
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-90">Vehículo Asignado</h4>
                    <p className="text-lg font-bold text-blue-600">{viaje.vehiculo.placa}</p>
                    <p className="text-sm text-gray-60">
                      {viaje.vehiculo.marca} {viaje.vehiculo.modelo}
                    </p>
                    {viaje.vehiculo.capacidad_carga && (
                      <p className="text-sm text-gray-60">
                        Capacidad: {viaje.vehiculo.capacidad_carga.toLocaleString()} kg
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Sin vehículo asignado</p>
              </div>
            )}

            {viaje.conductor ? (
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-90">Conductor Asignado</h4>
                    <p className="text-lg font-bold text-green-600">{viaje.conductor.nombre}</p>
                    <p className="text-sm text-gray-60">
                      Licencia: {viaje.conductor.tipo_licencia || 'No especificada'}
                    </p>
                    {viaje.conductor.telefono && (
                      <p className="text-sm text-gray-60">
                        Tel: {viaje.conductor.telefono}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Sin conductor asignado</p>
              </div>
            )}
          </ResponsiveGrid>
        </ResponsiveCardContent>
      </ResponsiveCard>
    </div>
  );
};
