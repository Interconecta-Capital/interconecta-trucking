import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import { useOperacionesEventos } from '@/hooks/useOperacionesEventos';
import { TripDetailModal } from '@/components/dashboard/TripDetailModal';
import { CalendarEvent } from '@/hooks/useCalendarEvents';

moment.locale('es');
const localizer = momentLocalizer(moment);

export function OperationsCalendar() {
  const { eventos, isLoading } = useOperacionesEventos();
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [open, setOpen] = useState(false);

  const calendarEvents: CalendarEvent[] = eventos.map(ev => ({
    id: ev.id,
    titulo: ev.titulo,
    tipo_evento: ev.tipo,
    descripcion: '',
    fecha_inicio: new Date(ev.fecha_inicio),
    fecha_fin: ev.fecha_fin ? new Date(ev.fecha_fin) : new Date(ev.fecha_inicio),
    metadata: ev.metadata,
  }));

  const rbcEvents = calendarEvents.map(ev => ({
    id: ev.id,
    title: ev.titulo,
    start: ev.fecha_inicio,
    end: ev.fecha_fin!,
    resource: {
      tipo_evento: ev.tipo_evento,
      descripcion: ev.descripcion,
      metadata: ev.metadata,
    },
  }));

  const handleSelectEvent = (event: any) => {
    setSelected(event);
    setOpen(true);
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#6366f1';
    const estado = event.resource.metadata?.estado;
    if (event.resource.tipo_evento === 'mantenimiento') {
      backgroundColor = '#ef4444';
    } else {
      switch (estado) {
        case 'programado':
          backgroundColor = '#3b82f6';
          break;
        case 'en_transito':
        case 'en_curso':
          backgroundColor = '#10b981';
          break;
        case 'retrasado':
          backgroundColor = '#f59e0b';
          break;
        case 'cancelado':
          backgroundColor = '#ef4444';
          break;
        case 'completado':
          backgroundColor = '#6b7280';
          break;
      }
    }
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
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
    showMore: (total: number) => `+ Ver más (${total})`,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div style={{ height: '80vh' }}>
        <Calendar
          localizer={localizer}
          events={rbcEvents}
          startAccessor="start"
          endAccessor="end"
          messages={messages}
          popup
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          culture="es"
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
        />
      </div>
      {selected && (
        <TripDetailModal event={selected} open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
