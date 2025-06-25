
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
  const { eventos, isLoading } = useOperacionesEventos();
  const [selected, setSelected] = useState<CalendarEventData | null>(null);
  const [open, setOpen] = useState(false);
  const { createEvent } = useCalendarEvents();
  const [extraEvents, setExtraEvents] = useState<EventInput[]>([]);

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

  const allEvents = [...fcEvents, ...extraEvents];

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

  const handleDateClick = async (info: DateClickArg) => {
    const title = window.prompt('Título del evento');
    if (!title) return;
    try {
      await createEvent({
        tipo_evento: 'personal',
        titulo: title,
        fecha_inicio: info.date,
        fecha_fin: info.date,
      });
      const color = '#6366f1';
      setExtraEvents((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          title,
          start: info.date,
          end: info.date,
          backgroundColor: color,
          borderColor: color,
        },
      ]);
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
          events={allEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          />
      </div>
      {selected && (
        <TripDetailModal event={selected} open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
