
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Truck, 
  User, 
  Package,
  FileText,
  Phone,
  Calendar,
  Weight,
  DollarSign,
  Route,
  AlertTriangle
} from 'lucide-react';
import { ViajeCompleto } from '@/hooks/useViajesCompletos';

interface ViajeTrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viaje: ViajeCompleto | null;
}

export function ViajeTrackingModal({ open, onOpenChange, viaje }: ViajeTrackingModalProps) {
  if (!viaje) return null;

  // Mock data para el tracking - en el futuro se conectará con un servicio real de GPS
  const trackingData = {
    ubicacionActual: "Carretera México-Guadalajara, Km 125",
    coordenadas: { lat: 19.4326, lng: -99.1332 },
    velocidad: "85 km/h",
    ultimaActualizacion: new Date().toLocaleTimeString(),
    tiempoEstimadoLlegada: "2024-06-12T16:30:00Z",
    distanciaRecorrida: 125,
    distanciaTotal: 350
  };

  const progreso = (trackingData.distanciaRecorrida / trackingData.distanciaTotal) * 100;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado: string) => {
    const configs = {
      programado: { label: 'Programado', className: 'bg-blue-100 text-blue-800' },
      en_transito: { label: 'En Tránsito', className: 'bg-green-100 text-green-800' },
      completado: { label: 'Completado', className: 'bg-green-100 text-green-800' },
      cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
      retrasado: { label: 'Retrasado', className: 'bg-orange-100 text-orange-800' }
    };
    
    const config = configs[estado as keyof typeof configs] || 
                  { label: estado, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const calcularPesoTotal = () => {
    return viaje.mercancias?.reduce((total, m) => total + (m.peso_kg * m.cantidad), 0) || 0;
  };

  const calcularValorTotal = () => {
    return viaje.mercancias?.reduce((total, m) => total + (m.valor_total || 0), 0) || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Tracking en Tiempo Real - {viaje.carta_porte_id}
            </DialogTitle>
            {getEstadoBadge(viaje.estado)}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Estado y última actualización */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Estado del viaje:</span>
              {getEstadoBadge(viaje.estado)}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Última actualización: {trackingData.ultimaActualizacion}
            </div>
          </div>

          {/* Progreso del viaje */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Progreso del viaje</span>
              <span className="text-sm text-gray-600">
                {trackingData.distanciaRecorrida} / {trackingData.distanciaTotal} km
              </span>
            </div>
            <Progress value={progreso} className="h-3" />
            <div className="text-center text-sm text-gray-600">
              {Math.round(progreso)}% completado
            </div>
          </div>

          {/* Grid principal con información */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Columna izquierda - Ruta y ubicación */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-base flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Ruta del Viaje
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <span className="font-medium text-green-800">Origen</span>
                      <p className="text-sm text-green-700">{viaje.origen}</p>
                      <p className="text-xs text-green-600">
                        Salida programada: {formatDateTime(viaje.fecha_inicio_programada)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Navigation className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <span className="font-medium text-blue-800">Ubicación Actual</span>
                      <p className="text-sm text-blue-700">{trackingData.ubicacionActual}</p>
                      <p className="text-xs text-blue-600">
                        Velocidad: {trackingData.velocidad}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-red-600 mt-1" />
                    <div>
                      <span className="font-medium text-red-800">Destino</span>
                      <p className="text-sm text-red-700">{viaje.destino}</p>
                      <p className="text-xs text-red-600">
                        ETA: {new Date(trackingData.tiempoEstimadoLlegada).toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recursos asignados */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base">Recursos Asignados</h4>
                <div className="space-y-3">
                  {/* Vehículo */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      {viaje.vehiculo ? (
                        <>
                          <p className="font-medium">{viaje.vehiculo.placa}</p>
                          <p className="text-sm text-gray-600">
                            {viaje.vehiculo.marca} {viaje.vehiculo.modelo} {viaje.vehiculo.anio}
                          </p>
                          <p className="text-xs text-gray-500">
                            Capacidad: {viaje.vehiculo.capacidad_carga} kg
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500">Sin vehículo asignado</p>
                      )}
                    </div>
                  </div>

                  {/* Conductor */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      {viaje.conductor ? (
                        <>
                          <p className="font-medium">{viaje.conductor.nombre}</p>
                          <p className="text-sm text-gray-600">
                            Licencia: {viaje.conductor.tipo_licencia}
                          </p>
                          {viaje.conductor.telefono && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {viaje.conductor.telefono}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500">Sin conductor asignado</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha - Carga y cliente */}
            <div className="space-y-6">
              
              {/* Información del cliente */}
              {viaje.cliente && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-base">Cliente</h4>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900">{viaje.cliente.nombre}</p>
                    <p className="text-sm text-purple-700">RFC: {viaje.cliente.rfc}</p>
                    {viaje.cliente.direccion && (
                      <p className="text-xs text-purple-600 mt-1">{viaje.cliente.direccion}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Información de la carga */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Carga Transportada
                </h4>
                
                {/* Resumen de la carga */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <Weight className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-orange-800">
                      {calcularPesoTotal().toFixed(0)} kg
                    </p>
                    <p className="text-xs text-orange-600">Peso Total</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-green-800">
                      ${calcularValorTotal().toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">Valor Total</p>
                  </div>
                </div>

                {/* Lista de mercancías */}
                {viaje.mercancias && viaje.mercancias.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Detalle de Mercancías:</p>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {viaje.mercancias.map((mercancia, index) => (
                        <div key={mercancia.id} className="p-2 bg-gray-50 rounded text-sm">
                          <p className="font-medium">{mercancia.descripcion}</p>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Cantidad: {mercancia.cantidad}</span>
                            <span>Peso: {mercancia.peso_kg} kg</span>
                          </div>
                          {mercancia.tipo_embalaje && (
                            <p className="text-xs text-gray-500">Embalaje: {mercancia.tipo_embalaje}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Información de la carta porte */}
              {viaje.carta_porte && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Carta Porte
                  </h4>
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Estado:</span>
                      <Badge className={
                        viaje.carta_porte.status === 'timbrado' ? 'bg-green-100 text-green-800' :
                        viaje.carta_porte.status === 'borrador' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {viaje.carta_porte.status === 'timbrado' ? 'Timbrado' : 
                         viaje.carta_porte.status === 'borrador' ? 'Borrador' : 'Pendiente'}
                      </Badge>
                    </div>
                    {viaje.carta_porte.folio && (
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Folio:</span>
                        <span className="text-sm font-mono">{viaje.carta_porte.folio}</span>
                      </div>
                    )}
                    {viaje.carta_porte.uuid_fiscal && (
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">UUID:</span>
                        <span className="text-xs font-mono">{viaje.carta_porte.uuid_fiscal.slice(0, 8)}...</span>
                      </div>
                    )}
                    {viaje.carta_porte.fecha_timbrado && (
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Timbrado:</span>
                        <span className="text-sm">{formatDateTime(viaje.carta_porte.fecha_timbrado)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Área del mapa (placeholder mejorado) */}
          <div className="space-y-2">
            <h4 className="font-semibold text-base">Mapa de Seguimiento</h4>
            <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300">
              <div className="text-center text-blue-600">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <p className="font-medium">Mapa de tracking en tiempo real</p>
                <p className="text-sm mt-1">Integración pendiente con Google Maps API</p>
                <p className="text-xs mt-2 text-blue-500">
                  Coordenadas actuales: {trackingData.coordenadas.lat}, {trackingData.coordenadas.lng}
                </p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {viaje.observaciones && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Observaciones</p>
                  <p className="text-sm text-yellow-700">{viaje.observaciones}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
              <Button>
                <Navigation className="h-4 w-4 mr-2" />
                Abrir en Mapa
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
