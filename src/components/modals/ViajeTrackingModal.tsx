
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Truck, 
  Package,
  Phone,
  User,
  Route,
  Fuel
} from 'lucide-react';
import { ViajeCompleto } from '@/hooks/useViajesCompletos';
import { useRealGoogleMaps } from '@/hooks/useRealGoogleMaps';

interface ViajeTrackingModalProps {
  viaje: ViajeCompleto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViajeTrackingModal = ({ viaje, open, onOpenChange }: ViajeTrackingModalProps) => {
  const { calcularRutaReal, routeData, isCalculating } = useRealGoogleMaps();
  const [trackingActualizado, setTrackingActualizado] = useState<Date | null>(null);

  // Calcular ruta real cuando se abre el modal
  useEffect(() => {
    if (open && viaje && !routeData) {
      calcularRutaReal(viaje.origen, viaje.destino);
    }
  }, [open, viaje, routeData, calcularRutaReal]);

  // Simular actualizaciones de tracking cada 30 segundos
  useEffect(() => {
    if (open && viaje?.estado === 'en_transito') {
      const interval = setInterval(() => {
        setTrackingActualizado(new Date());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [open, viaje?.estado]);

  if (!viaje) return null;

  const obtenerUbicacionActual = () => {
    if (viaje.estado === 'programado') {
      return `En origen: ${viaje.origen}`;
    }
    
    if (viaje.estado === 'completado') {
      return `En destino: ${viaje.destino}`;
    }

    // Para viajes en tránsito, simular ubicación en ruta
    const progreso = getProgresoViaje(viaje);
    if (progreso < 30) {
      return `Saliendo de ${viaje.origen}`;
    } else if (progreso < 70) {
      return `En tránsito - Carretera ${viaje.origen} - ${viaje.destino}`;
    } else {
      return `Aproximándose a ${viaje.destino}`;
    }
  };

  const getProgresoViaje = (viaje: ViajeCompleto) => {
    if (viaje.estado === 'completado') return 100;
    if (viaje.estado === 'programado') return 0;
    
    if (viaje.fecha_inicio_real && viaje.fecha_fin_programada) {
      const inicio = new Date(viaje.fecha_inicio_real).getTime();
      const fin = new Date(viaje.fecha_fin_programada).getTime();
      const ahora = new Date().getTime();
      
      const tiempoTotal = fin - inicio;
      const tiempoTranscurrido = ahora - inicio;
      
      return Math.min(Math.max((tiempoTranscurrido / tiempoTotal) * 100, 5), 95);
    }
    
    return 25;
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

  const getEstadoBadge = (estado: string) => {
    const configs = {
      programado: { label: 'Programado', className: 'bg-blue-500 text-white' },
      en_transito: { label: 'En Tránsito', className: 'bg-green-500 text-white' },
      completado: { label: 'Completado', className: 'bg-gray-500 text-white' },
      cancelado: { label: 'Cancelado', className: 'bg-red-500 text-white' },
      retrasado: { label: 'Retrasado', className: 'bg-orange-500 text-white' }
    };
    
    const config = configs[estado as keyof typeof configs] || 
                  { label: estado, className: 'bg-gray-500 text-white' };
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Tracking en Tiempo Real - {viaje.carta_porte_id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Estado actual y última actualización */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Estado:</span>
              {getEstadoBadge(viaje.estado)}
            </div>
            <div className="text-sm text-gray-600">
              Última actualización: {trackingActualizado?.toLocaleTimeString() || 'Iniciando...'}
            </div>
          </div>

          {/* Información de ruta REAL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ruta y ubicación */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Route className="h-5 w-5" />
                Información de Ruta
              </h4>
              
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <span className="text-xs font-medium text-gray-600 uppercase">Origen</span>
                    <p className="font-medium text-gray-900">{viaje.origen}</p>
                  </div>
                </div>
                
                <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-8"></div>
                
                <div className="flex items-center gap-3">
                  <Navigation className="h-3 w-3 text-blue-600" />
                  <div>
                    <span className="text-xs font-medium text-blue-600 uppercase">Ubicación Actual</span>
                    <p className="font-medium text-gray-900">{obtenerUbicacionActual()}</p>
                  </div>
                </div>
                
                <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-8"></div>
                
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <span className="text-xs font-medium text-gray-600 uppercase">Destino</span>
                    <p className="font-medium text-gray-900">{viaje.destino}</p>
                  </div>
                </div>
              </div>

              {/* Datos REALES de Google Maps */}
              {routeData && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-2">Datos de Ruta (Google Maps)</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600">Distancia:</span>
                      <p className="font-semibold">{routeData.distance_km} km</p>
                    </div>
                    <div>
                      <span className="text-green-600">Duración:</span>
                      <p className="font-semibold">
                        {Math.floor(routeData.duration_minutes / 60)}h {routeData.duration_minutes % 60}m
                      </p>
                    </div>
                  </div>
                  {routeData.fallback && (
                    <p className="text-xs text-orange-600 mt-2">
                      Nota: {routeData.fallback_reason}
                    </p>
                  )}
                </div>
              )}

              {isCalculating && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">Calculando ruta con Google Maps...</p>
                </div>
              )}
            </div>

            {/* Detalles del viaje */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Detalles del Viaje</h4>
              
              {/* Progreso */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Progreso del viaje</span>
                  <span className="text-sm font-bold">{Math.round(getProgresoViaje(viaje))}%</span>
                </div>
                <Progress value={getProgresoViaje(viaje)} className="h-3" />
              </div>

              {/* Conductor y Vehículo */}
              <div className="grid grid-cols-1 gap-4">
                {viaje.conductor && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Conductor</span>
                    </div>
                    <p className="font-semibold">{viaje.conductor.nombre}</p>
                    {viaje.conductor.telefono && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        <span className="text-sm">{viaje.conductor.telefono}</span>
                      </div>
                    )}
                  </div>
                )}

                {viaje.vehiculo && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-800">Vehículo</span>
                    </div>
                    <p className="font-semibold">{viaje.vehiculo.placa}</p>
                    <p className="text-sm text-gray-600">
                      {viaje.vehiculo.marca} {viaje.vehiculo.modelo} {viaje.vehiculo.anio}
                    </p>
                  </div>
                )}
              </div>

              {/* Mercancías */}
              {viaje.mercancias && viaje.mercancias.length > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-800">Carga</span>
                  </div>
                  <p className="text-sm">{viaje.mercancias.length} tipo(s) de mercancía</p>
                  <p className="text-sm">
                    Peso total: {viaje.mercancias.reduce((total, m) => total + (m.peso_kg * m.cantidad), 0).toFixed(0)} kg
                  </p>
                </div>
              )}

              {/* Tiempos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Inicio programado:</span>
                </div>
                <p className="text-sm ml-6">{formatDateTime(viaje.fecha_inicio_programada)}</p>
                
                {viaje.fecha_inicio_real && (
                  <>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Inicio real:</span>
                    </div>
                    <p className="text-sm ml-6">{formatDateTime(viaje.fecha_inicio_real)}</p>
                  </>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Fin programado:</span>
                </div>
                <p className="text-sm ml-6">{formatDateTime(viaje.fecha_fin_programada)}</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cerrar
            </Button>
            {viaje.estado === 'en_transito' && (
              <Button 
                onClick={() => {
                  calcularRutaReal(viaje.origen, viaje.destino);
                  setTrackingActualizado(new Date());
                }}
                disabled={isCalculating}
                className="flex-1"
              >
                {isCalculating ? 'Actualizando...' : 'Actualizar Ubicación'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
