import { useState } from 'react';
import FullCalendar, {
  type EventClickArg,
  type EventInput,
  type DateClickArg,
} from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { useOperacionesEventos } from '@/hooks/useOperacionesEventos';
import { TripDetailModal } from '@/components/dashboard/TripDetailModal';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Plus, Truck, Wrench, CheckCircle, MapPin } from 'lucide-react';
import { CartaPorteFormModal } from '@/components/dashboard/CartaPorteFormModal';
import { MantenimientoFormModal } from '@/components/dashboard/MantenimientoFormModal';
import { VerificacionFormModal } from '@/components/dashboard/VerificacionFormModal';
import { RevisionGPSFormModal } from '@/components/dashboard/RevisionGPSFormModal';



interface OperationsCalendarProps {
  showViajes: boolean;
  showMantenimientos: boolean;
}

export function OperationsCalendar({ showViajes, showMantenimientos }: OperationsCalendarProps) {
  const { eventos, isLoading } = useOperacionesEventos();
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showEventMenu, setShowEventMenu] = useState(false);
  const [showCartaPorteForm, setShowCartaPorteForm] = useState(false);
  const [showMantenimientoForm, setShowMantenimientoForm] = useState(false);
  const [showVerificacionForm, setShowVerificacionForm] = useState(false);
  const [showRevisionGPSForm, setShowRevisionGPSForm] = useState(false);

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


  const handleEventClick = (info: EventClickArg) => {
    const event: CalendarEvent = {
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
    setShowEventMenu(true);
  };

  const handleCreateViaje = () => {
    setShowCartaPorteForm(true);
    setShowEventMenu(false);
  };

  const handleCreateMantenimiento = () => {
    setShowMantenimientoForm(true);
    setShowEventMenu(false);
  };

  const handleCreateVerificacion = () => {
    setShowVerificacionForm(true);
    setShowEventMenu(false);
  };

  const handleCreateRevisionGPS = () => {
    setShowRevisionGPSForm(true);
    setShowEventMenu(false);
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
          events={fcEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          />
      </div>
      <Popover open={showEventMenu} onOpenChange={setShowEventMenu}>
        <PopoverTrigger asChild>
          <div></div>
        </PopoverTrigger>
        <PopoverContent className="w-72 z-50" align="center" side="top">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <h4 className="font-medium">Crear Evento</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedDate?.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="w-full justify-start h-9"
                onClick={handleCreateViaje}
              >
                <Truck className="h-4 w-4 mr-2 text-green-600" />
                Programar Viaje
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-9"
                onClick={handleCreateMantenimiento}
              >
                <Wrench className="h-4 w-4 mr-2 text-red-600" />
                Mantenimiento
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-9"
                onClick={handleCreateVerificacion}
              >
                <CheckCircle className="h-4 w-4 mr-2 text-orange-600" />
                Verificación
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-9"
                onClick={handleCreateRevisionGPS}
              >
                <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                Revisión GPS
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {selected && (
        <TripDetailModal event={selected} open={open} onOpenChange={setOpen} />
      )}
      <CartaPorteFormModal
        open={showCartaPorteForm}
        onOpenChange={setShowCartaPorteForm}
      />
      <MantenimientoFormModal
        open={showMantenimientoForm}
        onOpenChange={setShowMantenimientoForm}
      />
      <VerificacionFormModal
        open={showVerificacionForm}
        onOpenChange={setShowVerificacionForm}
      />
      <RevisionGPSFormModal
        open={showRevisionGPSForm}
        onOpenChange={setShowRevisionGPSForm}
      />
    </>
  );
}
