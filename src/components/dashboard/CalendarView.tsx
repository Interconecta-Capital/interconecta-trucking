import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPin, Clock, Truck } from 'lucide-react';
import { TripDetailModal } from './TripDetailModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

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

export function CalendarView() {
  const { user } = useSimpleAuth();
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

  const calendarEvents: CalendarEvent[] = eventos.map(evento => ({
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

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    
    switch (event.resource.tipo_evento) {
      case 'viaje':
        backgroundColor = '#10b981';
        break;
      case 'entrega':
        backgroundColor = '#f59e0b';
        break;
      case 'mantenimiento':
        backgroundColor = '#ef4444';
        break;
      default:
        backgroundColor = '#6366f1';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango.',
    showMore: total => `+ Ver más (${total})`
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
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              messages={messages}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              popup
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              culture="es"
            />
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
