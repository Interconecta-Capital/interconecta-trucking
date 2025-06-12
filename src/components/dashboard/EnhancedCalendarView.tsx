
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
  });

  // Mock data para mostrar eventos en el calendario
  const mockEventos = [
    {
      fecha: new Date(2024, 5, 15),
      tipo: 'viaje',
      titulo: 'Viaje CDMX - Guadalajara'
    },
    {
      fecha: new Date(2024, 5, 18),
      tipo: 'mantenimiento',
      titulo: 'Mantenimiento Vehículo'
    },
    {
      fecha: new Date(2024, 5, 20),
      tipo: 'entrega',
      titulo: 'Entrega Cliente XYZ'
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

  const eventStylesForDate = (date: Date) => {
    const hasEvent = mockEventos.some(evento => 
      evento.fecha.toDateString() === date.toDateString()
    );
    
    if (hasEvent) {
      return 'bg-blue-100 text-blue-900 font-semibold';
    }
    return '';
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
              <Wrench className="h-3 w-3 mr-1" />
              Mantenimiento
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className={cn("rounded-md border pointer-events-auto")}
            modifiersClassNames={{
              selected: "bg-primary text-primary-foreground"
            }}
          />
          
          {/* Eventos próximos */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Próximos Eventos</h4>
            {mockEventos.slice(0, 3).map((evento, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center gap-2">
                  {evento.tipo === 'viaje' && <Truck className="h-4 w-4 text-green-600" />}
                  {evento.tipo === 'mantenimiento' && <Wrench className="h-4 w-4 text-red-600" />}
                  {evento.tipo === 'entrega' && <MapPin className="h-4 w-4 text-orange-600" />}
                  <div>
                    <p className="text-sm font-medium">{evento.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {evento.fecha.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Popover para crear eventos */}
      <Popover open={showEventMenu} onOpenChange={setShowEventMenu}>
        <PopoverTrigger asChild>
          <div></div>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="center">
          <div className="space-y-2">
            <h4 className="font-medium">Crear Evento</h4>
            <p className="text-sm text-muted-foreground">
              {selectedDate?.toLocaleDateString()}
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleCreateEvent('viaje', 'Nuevo Viaje')}
              >
                <Truck className="h-4 w-4 mr-2" />
                Programar Viaje
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleCreateEvent('mantenimiento', 'Mantenimiento Mecánico')}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Mantenimiento
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleCreateEvent('verificacion', 'Verificación')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verificación
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleCreateEvent('revision_gps', 'Revisión GPS')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Revisión GPS
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Card>
  );
}
