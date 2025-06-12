
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

  // Mock data mejorado para mejor visualización
  const mockEventos = [
    {
      fecha: new Date(2024, 5, 15),
      tipo: 'viaje',
      titulo: 'Viaje CDMX - Guadalajara',
      color: 'bg-green-100 text-green-800'
    },
    {
      fecha: new Date(2024, 5, 18),
      tipo: 'mantenimiento',
      titulo: 'Mantenimiento Preventivo',
      color: 'bg-red-100 text-red-800'
    },
    {
      fecha: new Date(2024, 5, 20),
      tipo: 'entrega',
      titulo: 'Entrega Cliente XYZ',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      fecha: new Date(2024, 5, 22),
      tipo: 'revision_gps',
      titulo: 'Revisión GPS',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      fecha: new Date(2024, 5, 25),
      tipo: 'verificacion',
      titulo: 'Verificación Vehicular',
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setShowEventMenu(true);
    }
  };

  const handleCreateEvent = async (tipo: string, titulo: string) => {
    if (!selectedDate) return;
    
    try {
      await createEvent({
        tipo,
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

  // Modificador personalizado para el calendario
  const eventModifiers = {
    hasEvents: (date: Date) => getEventsForDate(date).length > 0
  };

  const eventModifiersClassNames = {
    hasEvents: "relative"
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
        {/* Calendario más grande */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className={cn("rounded-md border pointer-events-auto", isMobile ? "text-sm" : "text-base")}
            modifiers={eventModifiers}
            modifiersClassNames={{
              selected: "bg-primary text-primary-foreground",
              ...eventModifiersClassNames
            }}
            components={{
              Day: ({ date, displayMonth, ...props }) => {
                const events = getEventsForDate(date);
                const hasEvents = events.length > 0;
                
                return (
                  <div className="relative">
                    <button {...props} className={cn(props.className, "relative")}>
                      {date.getDate()}
                      {hasEvents && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                          {events.slice(0, 3).map((evento, index) => (
                            <div
                              key={index}
                              className={cn(
                                "w-1 h-1 rounded-full",
                                evento.tipo === 'viaje' && "bg-green-600",
                                evento.tipo === 'mantenimiento' && "bg-red-600",
                                evento.tipo === 'entrega' && "bg-blue-600",
                                evento.tipo === 'revision_gps' && "bg-purple-600",
                                evento.tipo === 'verificacion' && "bg-orange-600"
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                );
              }
            }}
          />
        </div>
        
        {/* Lista de eventos próximos mejorada */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Próximos Eventos
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {mockEventos.slice(0, 5).map((evento, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {evento.tipo === 'viaje' && <Truck className="h-4 w-4 text-green-600" />}
                  {evento.tipo === 'mantenimiento' && <Wrench className="h-4 w-4 text-red-600" />}
                  {evento.tipo === 'entrega' && <MapPin className="h-4 w-4 text-orange-600" />}
                  {evento.tipo === 'revision_gps' && <MapPin className="h-4 w-4 text-purple-600" />}
                  {evento.tipo === 'verificacion' && <CheckCircle className="h-4 w-4 text-orange-600" />}
                  <div>
                    <p className="text-sm font-medium">{evento.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {evento.fecha.toLocaleDateString('es-ES', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={evento.color}>
                  {evento.tipo.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Popover mejorado para crear eventos */}
      <Popover open={showEventMenu} onOpenChange={setShowEventMenu}>
        <PopoverTrigger asChild>
          <div></div>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="center">
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
  );
}
