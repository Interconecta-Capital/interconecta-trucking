
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
  AlertTriangle
} from 'lucide-react';
import { ViajeCompleto } from '@/hooks/useViajesCompletos';

interface TrackingViajeRealTimeProps {
  viaje: ViajeCompleto;
}

export const TrackingViajeRealTime = ({ viaje }: TrackingViajeRealTimeProps) => {
  
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgresoViaje = (viaje: ViajeCompleto) => {
    if (viaje.estado === 'completado') return 100;
    if (viaje.estado === 'programado') return 0;
    if (viaje.estado === 'en_transito') return 50; // Progreso estimado
    return 25;
  };

  return (
    <div className="space-y-6">
      {/* Estado del viaje */}
      <ResponsiveCard className="border-blue-200 bg-blue-50">
        <ResponsiveCardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-semibold text-blue-800">Estado: {viaje.estado}</h3>
                <p className="text-sm text-blue-700">
                  Carta Porte: {viaje.carta_porte_id}
                </p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              <Navigation className="h-3 w-3 mr-1" />
              Activo
            </Badge>
          </div>
        </ResponsiveCardContent>
      </ResponsiveCard>

      {/* Información de ruta */}
      <ResponsiveGrid cols={{ default: 1, md: 2 }} gap={{ default: 4, md: 6 }}>
        <ResponsiveCard>
          <ResponsiveCardHeader>
            <ResponsiveCardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Ruta del Viaje
            </ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Origen</p>
                  <p className="font-medium text-gray-900">{viaje.origen}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Destino</p>
                  <p className="font-medium text-gray-900">{viaje.destino}</p>
                </div>
              </div>
            </div>

            {/* Progreso */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Progreso</span>
                <span className="text-sm font-bold text-gray-900">{Math.round(getProgresoViaje(viaje))}%</span>
              </div>
              <Progress value={getProgresoViaje(viaje)} className="h-3" />
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <ResponsiveCardHeader>
            <ResponsiveCardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Tiempos del Viaje
            </ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600 uppercase">Inicio Programado</span>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {formatDateTime(viaje.fecha_inicio_programada)}
                </p>
              </div>
              
              {viaje.fecha_inicio_real && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-600 uppercase">Inicio Real</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {formatDateTime(viaje.fecha_inicio_real)}
                  </p>
                </div>
              )}
              
              <div className="p-3 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600 uppercase">Fin Programado</span>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {formatDateTime(viaje.fecha_fin_programada)}
                </p>
              </div>
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      </ResponsiveGrid>

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
                    <h4 className="font-medium text-gray-900">Vehículo</h4>
                    <p className="text-lg font-bold text-blue-600">{viaje.vehiculo.placa}</p>
                    <p className="text-sm text-gray-600">
                      {viaje.vehiculo.marca} {viaje.vehiculo.modelo}
                    </p>
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
                    <h4 className="font-medium text-gray-900">Conductor</h4>
                    <p className="text-lg font-bold text-green-600">{viaje.conductor.nombre}</p>
                    <p className="text-sm text-gray-600">
                      Licencia: {viaje.conductor.tipo_licencia || 'No especificada'}
                    </p>
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

      {/* Mercancías si existen */}
      {viaje.mercancias && viaje.mercancias.length > 0 && (
        <ResponsiveCard>
          <ResponsiveCardHeader>
            <ResponsiveCardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Carga Transportada
            </ResponsiveCardTitle>
          </ResponsiveCardHeader>
          <ResponsiveCardContent>
            <div className="space-y-3">
              {viaje.mercancias.map((mercancia, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {mercancia.descripcion || `Mercancía ${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cantidad: {mercancia.cantidad} unidades
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {(mercancia.peso_kg * mercancia.cantidad).toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      )}
    </div>
  );
};
