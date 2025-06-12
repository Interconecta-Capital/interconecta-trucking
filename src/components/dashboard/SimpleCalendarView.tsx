
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPin, Clock, Truck } from 'lucide-react';
import { TripDetailModal } from './TripDetailModal';

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

export function SimpleCalendarView() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['eventos-calendario', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('eventos_calendario')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_inicio', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Crear algunos eventos de ejemplo si no hay datos
  const eventosEjemplo = [
    {
      id: '1',
      titulo: 'Entrega CDMX - Guadalajara',
      fecha_inicio: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      fecha_fin: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      tipo_evento: 'viaje',
      ubicacion_origen: 'Ciudad de México',
      ubicacion_destino: 'Guadalajara, Jalisco',
      descripcion: 'Entrega de mercancía electrónica',
      carta_porte_id: 'cp-001',
      metadata: { vehiculo: 'ABC-123', conductor: 'Juan Pérez' }
    },
    {
      id: '2',
      titulo: 'Mantenimiento Vehículo ABC-123',
      fecha_inicio: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      fecha_fin: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
      tipo_evento: 'mantenimiento',
      descripcion: 'Servicio programado y verificación',
      carta_porte_id: null,
      metadata: { taller: 'AutoServicio Central', costo_estimado: 2500 }
    },
    {
      id: '3',
      titulo: 'Recogida Monterrey',
      fecha_inicio: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      fecha_fin: new Date(Date.now() + 1000 * 60 * 60 * 50).toISOString(),
      tipo_evento: 'entrega',
      ubicacion_origen: 'Monterrey, NL',
      descripcion: 'Recogida de carga industrial',
      carta_porte_id: 'cp-002',
      metadata: { cliente: 'Industrias del Norte', peso: '15 toneladas' }
    },
  ];

  const eventosMostrar = eventos.length > 0 ? eventos : eventosEjemplo;

  const calendarEvents: CalendarEvent[] = eventosMostrar.map(evento => ({
    id: evento.id,
    title: evento.titulo,
    start: new Date(evento.fecha_inicio),
    end: new Date(evento.fecha_fin),
    resource: {
      tipo_evento: evento.tipo_evento,
      descripcion: evento.descripcion,
      ubicacion_origen: evento.ubicacion_origen,
      ubicacion_destino: evento.ubicacion_destino,
      carta_porte_id: evento.carta_porte_id,
      metadata: evento.metadata,
    },
  }));

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowTripModal(true);
  };

  const getEventTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'viaje':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'entrega':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mantenimiento':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case 'viaje':
        return <Truck className="h-4 w-4" />;
      case 'entrega':
        return <MapPin className="h-4 w-4" />;
      case 'mantenimiento':
        return <Clock className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Viajes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendario de Viajes
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Truck className="h-3 w-3 mr-1" />
                Viajes
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                <MapPin className="h-3 w-3 mr-1" />
                Entregas
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Próximos Eventos</h3>
            <div className="space-y-3">
              {calendarEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSelectEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getEventIcon(event.resource.tipo_evento)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={getEventTypeColor(event.resource.tipo_evento)}
                          >
                            {event.resource.tipo_evento}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {event.start.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {event.resource.descripcion && (
                          <p className="text-sm text-gray-500">
                            {event.resource.descripcion}
                          </p>
                        )}
                        {(event.resource.ubicacion_origen || event.resource.ubicacion_destino) && (
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {event.resource.ubicacion_origen && event.resource.ubicacion_destino
                                ? `${event.resource.ubicacion_origen} → ${event.resource.ubicacion_destino}`
                                : event.resource.ubicacion_origen || event.resource.ubicacion_destino
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedEvent && (
        <TripDetailModal
          event={selectedEvent}
          open={showTripModal}
          onOpenChange={setShowTripModal}
        />
      )}
    </>
  );
}
