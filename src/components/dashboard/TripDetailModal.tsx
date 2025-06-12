
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Truck, Package, Calendar } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    tipo_evento: string;
    descripcion?: string;
    ubicacion_origen?: string;
    ubicacion_destino?: string;
    carta_porte_id?: string;
    metadata?: any;
  };
}

interface TripDetailModalProps {
  event: CalendarEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TripDetailModal({ event, open, onOpenChange }: TripDetailModalProps) {
  const getEventTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'viaje':
        return 'bg-green-100 text-green-800';
      case 'entrega':
        return 'bg-orange-100 text-orange-800';
      case 'mantenimiento':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case 'viaje':
        return <Truck className="h-4 w-4" />;
      case 'entrega':
        return <Package className="h-4 w-4" />;
      case 'mantenimiento':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getEventIcon(event.resource.tipo_evento)}
            {event.title}
          </DialogTitle>
          <DialogDescription>
            Detalles del evento programado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de evento */}
          <div className="flex items-center gap-2">
            <Badge className={getEventTypeColor(event.resource.tipo_evento)}>
              {event.resource.tipo_evento.charAt(0).toUpperCase() + event.resource.tipo_evento.slice(1)}
            </Badge>
          </div>

          {/* Fechas y horarios */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Inicio</p>
                    <p className="text-sm text-muted-foreground">
                      {moment(event.start).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fin</p>
                    <p className="text-sm text-muted-foreground">
                      {moment(event.end).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ubicaciones */}
          {(event.resource.ubicacion_origen || event.resource.ubicacion_destino) && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {event.resource.ubicacion_origen && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Origen</p>
                        <p className="text-sm text-muted-foreground">
                          {event.resource.ubicacion_origen}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {event.resource.ubicacion_destino && (
                    <>
                      {event.resource.ubicacion_origen && <Separator />}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">Destino</p>
                          <p className="text-sm text-muted-foreground">
                            {event.resource.ubicacion_destino}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Descripción */}
          {event.resource.descripcion && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium mb-2">Descripción</h4>
                <p className="text-sm text-muted-foreground">
                  {event.resource.descripcion}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Carta Porte asociada */}
          {event.resource.carta_porte_id && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Carta Porte</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {event.resource.carta_porte_id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Duración */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duración</p>
                  <p className="text-sm text-muted-foreground">
                    {moment.duration(moment(event.end).diff(moment(event.start))).humanize()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
