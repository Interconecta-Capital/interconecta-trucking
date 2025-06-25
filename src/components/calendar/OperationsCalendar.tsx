
import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventClickArg, EventInput } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { useOperacionesEventos } from '@/hooks/useOperacionesEventos';
import { TripDetailModal } from '@/components/dashboard/TripDetailModal';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useUserEvents } from '@/hooks/useUserEvents';
import { EventFormModal } from './EventFormModal';
import { startOfMonth, endOfMonth } from 'date-fns';
import { DatesSetArg } from '@fullcalendar/core';

interface OperationsCalendarProps {
  showViajes: boolean;
  showMantenimientos: boolean;
}

interface CalendarEventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any;
}

export function OperationsCalendar({ showViajes, showMantenimientos }: OperationsCalendarProps) {
  const [range, setRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const { eventos, isLoading } = useOperacionesEventos(range.start, range.end);
  const { data: personalEvents = [] } = useUserEvents(range.start, range.end);
  const [selected, setSelected] = useState<CalendarEventData | null>(null);
  const [open, setOpen] = useState(false);
  const { createEvent } = useCalendarEvents();
  const [extraEvents, setExtraEvents] = useState<EventInput[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filtered = eventos.filter((ev) => {
    if (ev.tipo === 'viaje' && !showViajes) return false;
    if (ev.tipo === 'mantenimiento' && !showMantenimientos) return false;
    return true;
  });

  const getColor = (tipo: string, estado?: string) => {
    if (tipo === 'mantenimiento') return '#ef4444';
    switch (estado) {
      case 'programado':
        return '#3b82f6';
      case 'en_transito':
      case 'en_curso':
        return '#10b981';
      case 'retrasado':
        return '#f59e0b';
      case 'cancelado':
        return '#ef4444';
      case 'completado':
        return '#6b7280';
      default:
        return '#6366f1';
    }
  };

  const fcEvents: EventInput[] = filtered.map((ev) => {
    const color = getColor(ev.tipo, ev.metadata?.estado);
    return {
      id: ev.id,
      title: ev.titulo,
      start: ev.fecha_inicio,
      end: ev.fecha_fin ?? ev.fecha_inicio,
      allDay: ev.metadata?.todo_dia ?? false,
      backgroundColor: color,
      borderColor: color,
      extendedProps: {
        tipo_evento: ev.tipo,
        metadata: ev.metadata,
      },
    };
  });

  const personalFcEvents: EventInput[] = (personalEvents as any[]).map((ev) => ({
    id: ev.id,
    title: ev.titulo,
    start: ev.fecha_inicio,
    end: ev.fecha_fin ?? ev.fecha_inicio,
    allDay: ev.metadata?.todo_dia ?? false,
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    extendedProps: { tipo_evento: ev.tipo_evento, metadata: ev.metadata },
  }));

  const allEvents = [...fcEvents, ...personalFcEvents, ...extraEvents];

  const handleEventClick = (info: EventClickArg) => {
    const event: CalendarEventData = {
      id: String(info.event.id),
      title: info.event.title,
      start: info.event.start ?? new Date(),
      end: info.event.end ?? info.event.start ?? new Date(),
      resource: info.event.extendedProps as any,
    };
    setSelected(event);
    setOpen(true);
  };

  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(info.date);
    setShowForm(true);
  };

  const submitEvent = async (data: { titulo: string; descripcion?: string; fecha_inicio: Date; fecha_fin: Date }) => {
    try {
      await createEvent({
        tipo_evento: 'personal',
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
      });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating event', err);
    }
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
        <FullCalendar
          height="100%"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
      headerToolbar={{ start: 'prev,next today', center: 'title', end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
          datesSet={(arg: DatesSetArg) => setRange({ start: arg.start, end: arg.end })}
          events={allEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          />
      </div>
      <EventFormModal
        open={showForm}
        onOpenChange={setShowForm}
        date={selectedDate}
        onSubmit={submitEvent}
      />
      {selected && (
        <TripDetailModal event={selected} open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
