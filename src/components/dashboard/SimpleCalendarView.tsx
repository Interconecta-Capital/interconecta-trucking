
import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPin, Truck } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

export function SimpleCalendarView() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Mock data para eventos del calendario
  const eventos = [
    {
      id: '1',
      titulo: 'Viaje CDMX - Guadalajara',
      fecha_inicio: '2024-01-15T08:00:00',
      fecha_fin: '2024-01-15T18:00:00',
      tipo_evento: 'viaje',
      ubicacion_origen: 'Ciudad de México',
      ubicacion_destino: 'Guadalajara',
      descripcion: 'Entrega de mercancía',
      carta_porte_id: 'CP-2024-001',
      metadata: { conductor: 'Juan Pérez', vehiculo: 'ABC-123-45' }
    },
    {
      id: '2',
      titulo: 'Mantenimiento Vehículo DEF-678',
      fecha_inicio: '2024-01-16T09:00:00',
      fecha_fin: '2024-01-16T15:00:00',
      tipo_evento: 'mantenimiento',
      ubicacion_origen: 'Taller Central',
      descripcion: 'Mantenimiento preventivo',
      carta_porte_id: null,
      metadata: { vehiculo: 'DEF-678-90', tipo: 'preventivo' }
    },
    {
      id: '3',
      titulo: 'Entrega Cliente XYZ',
      fecha_inicio: '2024-01-17T10:00:00',
      fecha_fin: '2024-01-17T12:00:00',
      tipo_evento: 'entrega',
      ubicacion_origen: 'Almacén Principal',
      ubicacion_destino: 'Cliente XYZ',
      descripcion: 'Entrega programada',
      carta_porte_id: 'CP-2024-002',
      metadata: { cliente: 'Cliente XYZ', productos: 'Electrodomésticos' }
    }
  ];

  const calendarEvents = eventos.map((evento) => ({
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
      metadata: evento.metadata
    }
  }));

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
  };

  const eventStyleGetter = (event: any) => {
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
    showMore: (total: number) => `+ Ver más (${total})`
  };

  return (
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
            <Badge variant="outline" className="bg-red-50 text-red-700">
              <span className="h-3 w-3 mr-1">🔧</span>
              Mantenimiento
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
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            messages={messages}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            popup
            step={60}
            showMultiDayTimes
          />
        </div>
        
        {selectedEvent && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">{selectedEvent.title}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Tipo:</strong> {selectedEvent.resource.tipo_evento}</p>
              <p><strong>Descripción:</strong> {selectedEvent.resource.descripcion}</p>
              {selectedEvent.resource.ubicacion_origen && (
                <p><strong>Origen:</strong> {selectedEvent.resource.ubicacion_origen}</p>
              )}
              {selectedEvent.resource.ubicacion_destino && (
                <p><strong>Destino:</strong> {selectedEvent.resource.ubicacion_destino}</p>
              )}
              {selectedEvent.resource.carta_porte_id && (
                <p><strong>Carta Porte:</strong> {selectedEvent.resource.carta_porte_id}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
