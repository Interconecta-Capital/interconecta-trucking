
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MapPin, Truck, Wrench, CheckCircle, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useIsMobile } from '@/hooks/use-mobile';
import { EventManagementModal } from './EventManagementModal';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function EnhancedCalendarView() {
  const { user } = useAuth();
  const { createEvent } = useCalendarEvents();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showEventMenu, setShowEventMenu] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventManagement, setShowEventManagement] = useState(false);

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
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Mock data mejorado para visualización como en las imágenes
  const mockEventos = [
    {
      fecha: new Date(2024, 5, 15),
      tipo: 'viaje',
      titulo: 'Viaje CDMX - Guadalajara',
      color: 'bg-green-500',
      estado: 'programado'
    },
    {
      fecha: new Date(2024, 5, 18),
      tipo: 'mantenimiento',
      titulo: 'Mantenimiento Preventivo',
      color: 'bg-red-500',
      estado: 'programado'
    },
    {
      fecha: new Date(2024, 5, 20),
      tipo: 'entrega',
      titulo: 'Entrega Cliente XYZ',
      color: 'bg-blue-500',
      estado: 'programado'
    },
    {
      fecha: new Date(2024, 5, 22),
      tipo: 'revision_gps',
      titulo: 'Revisión GPS',
      color: 'bg-purple-500',
      estado: 'programado'
    },
    {
      fecha: new Date(2024, 5, 25),
      tipo: 'verificacion',
      titulo: 'Verificación Vehicular',
      color: 'bg-orange-500',
      estado: 'programado'
    }
  ];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setShowEventMenu(true);
    }
  };

  const handleEventClick = (evento: any) => {
    // Convertir mock evento a formato esperado
    const eventForModal = {
      id: evento.id || Math.random().toString(),
      title: evento.titulo,
      start: evento.fecha,
      end: new Date(evento.fecha.getTime() + 60 * 60 * 1000),
      resource: {
        tipo_evento: evento.tipo,
        descripcion: evento.titulo,
        metadata: { estado: evento.estado || 'programado' }
      }
    };
    
    setSelectedEvent(eventForModal);
    setShowEventManagement(true);
  };

  const handleCreateEvent = async (tipo: string, titulo: string) => {
    if (!selectedDate) return;
    
    try {
      await createEvent({
        tipo_evento: tipo,
        titulo,
        descripcion: `${titulo} programado`,
        fecha_inicio: selectedDate,
        fecha_fin: new Date(selectedDate.getTime() + 60 * 60 * 1000), // 1 hora después
      });
      setShowEventMenu(false);
    } catch (error) {
      console.error('Error al crear evento:', error);
    }
  };

  // Función para obtener eventos de una fecha específica
  const getEventsForDate = (date: Date) => {
    return mockEventos.filter(evento => 
      evento.fecha.toDateString() === date.toDateString()
    );
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendario de Viajes
          </CardTitle>
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
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendario de Viajes
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                <Truck className="h-3 w-3 mr-1" />
                Viajes
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Entregas
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                <Wrench className="h-3 w-3 mr-1" />
                Mantenimiento
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calendario más grande y visual */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className={cn("rounded-md border pointer-events-auto w-full", isMobile ? "text-sm" : "text-base")}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-lg font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md w-full font-normal text-sm flex-1 text-center",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1 h-12",
                day: cn(
                  "h-12 w-full p-0 font-normal aria-selected:opacity-100 flex flex-col items-center justify-center relative hover:bg-accent rounded-md"
                ),
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_hidden: "invisible",
              }}
              components={{
                Day: ({ date, displayMonth }) => {
                  const events = getEventsForDate(date);
                  const hasEvents = events.length > 0;
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const isToday = new Date().toDateString() === date.toDateString();
                  
                  return (
                    <button
                      onClick={() => handleDateSelect(date)}
                      className={cn(
                        "h-12 w-full p-1 font-normal flex flex-col items-center justify-center relative hover:bg-accent rounded-md transition-colors",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        isToday && !isSelected && "bg-accent text-accent-foreground font-semibold",
                        date.getMonth() !== displayMonth.getMonth() && "text-muted-foreground opacity-50"
                      )}
                    >
                      <span className="text-sm">{date.getDate()}</span>
                      {hasEvents && (
                        <div className="flex gap-0.5 mt-0.5">
                          {events.slice(0, 3).map((evento, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(evento);
                              }}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full hover:scale-125 transition-transform",
                                evento.color
                              )}
                            />
                          ))}
                          {events.length > 3 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                }
              }}
            />
          </div>
        </CardContent>

        {/* Popover para crear eventos */}
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
                  day: 'numeric'
                })}
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-9"
                  onClick={() => handleCreateEvent('viaje', 'Nuevo Viaje')}
                >
                  <Truck className="h-4 w-4 mr-2 text-green-600" />
                  Programar Viaje
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-9"
                  onClick={() => handleCreateEvent('mantenimiento', 'Mantenimiento Preventivo')}
                >
                  <Wrench className="h-4 w-4 mr-2 text-red-600" />
                  Mantenimiento
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-9"
                  onClick={() => handleCreateEvent('verificacion', 'Verificación Vehicular')}
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-orange-600" />
                  Verificación
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-9"
                  onClick={() => handleCreateEvent('revision_gps', 'Revisión GPS')}
                >
                  <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                  Revisión GPS
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </Card>

      {/* Modal de gestión de eventos */}
      <EventManagementModal
        open={showEventManagement}
        onOpenChange={setShowEventManagement}
        event={selectedEvent}
      />
    </>
  );
}
