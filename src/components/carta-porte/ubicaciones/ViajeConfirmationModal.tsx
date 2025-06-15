
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Route, Calendar } from 'lucide-react';
import { Ubicacion } from '@/types/ubicaciones';

interface ViajeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSaveTrip: () => void;
  onConfirmContinue: () => void;
  ubicaciones: Ubicacion[];
  distanciaTotal?: number;
  tiempoEstimado?: number;
}

export function ViajeConfirmationModal({
  isOpen,
  onClose,
  onConfirmSaveTrip,
  onConfirmContinue,
  ubicaciones,
  distanciaTotal,
  tiempoEstimado
}: ViajeConfirmationModalProps) {
  const origen = ubicaciones.find(u => u.tipoUbicacion === 'Origen');
  const destino = ubicaciones.find(u => u.tipoUbicacion === 'Destino');
  const pasosIntermedios = ubicaciones.filter(u => u.tipoUbicacion === 'Paso Intermedio');

  const formatTime = (minutes?: number) => {
    if (!minutes) return 'No calculado';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-blue-600" />
            ¿Guardar este viaje en el módulo de Viajes?
          </DialogTitle>
          <DialogDescription>
            Has completado la configuración de ubicaciones. ¿Quieres guardar esta información como un viaje en planificación?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen de ruta */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-3">Resumen de Ruta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  <strong>Distancia:</strong> {distanciaTotal ? `${distanciaTotal} km` : 'No calculada'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  <strong>Tiempo estimado:</strong> {formatTime(tiempoEstimado)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Origen */}
              {origen && (
                <div className="flex items-start gap-3 p-3 bg-green-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-green-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="bg-green-200 text-green-800">
                        Origen
                      </Badge>
                      <span className="font-medium">{origen.nombreRemitenteDestinatario}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {origen.domicilio.calle} {origen.domicilio.numExterior}, {origen.domicilio.municipio}
                    </p>
                    {origen.fechaHoraSalidaLlegada && (
                      <div className="flex items-center gap-1 text-xs text-green-700 mt-1">
                        <Calendar className="h-3 w-3" />
                        Salida: {formatDate(origen.fechaHoraSalidaLlegada)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pasos intermedios */}
              {pasosIntermedios.map((paso, index) => (
                <div key={paso.idUbicacion} className="flex items-start gap-3 p-3 bg-blue-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                        Paso {index + 1}
                      </Badge>
                      <span className="font-medium">{paso.nombreRemitenteDestinatario || 'Punto intermedio'}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {paso.domicilio.calle} {paso.domicilio.numExterior}, {paso.domicilio.municipio}
                    </p>
                    {paso.fechaHoraSalidaLlegada && (
                      <div className="flex items-center gap-1 text-xs text-blue-700 mt-1">
                        <Calendar className="h-3 w-3" />
                        Paso estimado: {formatDate(paso.fechaHoraSalidaLlegada)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Destino */}
              {destino && (
                <div className="flex items-start gap-3 p-3 bg-red-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-red-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="bg-red-200 text-red-800">
                        Destino
                      </Badge>
                      <span className="font-medium">{destino.nombreRemitenteDestinatario}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {destino.domicilio.calle} {destino.domicilio.numExterior}, {destino.domicilio.municipio}
                    </p>
                    {destino.fechaHoraSalidaLlegada && (
                      <div className="flex items-center gap-1 text-xs text-red-700 mt-1">
                        <Calendar className="h-3 w-3" />
                        Llegada: {formatDate(destino.fechaHoraSalidaLlegada)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
            <strong>Nota:</strong> El viaje se guardará en estado "Planificación" hasta que la Carta Porte esté completada y timbrada.
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onConfirmContinue}
            className="flex-1"
          >
            No guardar, solo continuar
          </Button>
          
          <Button
            onClick={onConfirmSaveTrip}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Sí, guardar en Viajes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
