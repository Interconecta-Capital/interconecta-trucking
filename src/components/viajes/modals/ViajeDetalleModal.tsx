
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, User, Truck, FileText } from 'lucide-react';

interface ViajeDetalleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viaje: any; // Tipo temporal, se puede mejorar más adelante
}

export function ViajeDetalleModal({ open, onOpenChange, viaje }: ViajeDetalleModalProps) {
  if (!viaje) return null;

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      case 'en_transito':
        return <Badge className="bg-blue-100 text-blue-800">En Tránsito</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles del Viaje - Carta Porte: {viaje.carta_porte_id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Estado del Viaje</h3>
            {getEstadoBadge(viaje.estado)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-base">Ruta</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Origen:</span> {viaje.origen}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Destino:</span> {viaje.destino}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-base">Tiempos</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Inicio programado:</span>
                  <span className="text-sm">{new Date(viaje.fecha_inicio_programada).toLocaleString()}</span>
                </div>
                {viaje.fecha_inicio_real && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Inicio real:</span>
                    <span className="text-sm">{new Date(viaje.fecha_inicio_real).toLocaleString()}</span>
                  </div>
                )}
                {viaje.fecha_fin && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Finalización:</span>
                    <span className="text-sm">{new Date(viaje.fecha_fin).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-base">Recursos Asignados</h4>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Conductor:</span> {viaje.conductor || 'No asignado'}
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-600" />
                <span className="font-medium">Vehículo:</span> {viaje.vehiculo || 'No asignado'}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-base">Información Adicional</h4>
              <div className="text-sm text-muted-foreground">
                <p><span className="font-medium">ID del viaje:</span> {viaje.id}</p>
                <p><span className="font-medium">Carta Porte:</span> {viaje.carta_porte_id}</p>
              </div>
            </div>
          </div>

          {viaje.observaciones && (
            <div className="space-y-2">
              <h4 className="font-semibold text-base">Observaciones</h4>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {viaje.observaciones}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button>
              Generar Reporte
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
