
import { useState } from 'react';
import { Calendar, Wrench, CheckCircle, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

export function ScheduleDropdown() {
  const navigate = useNavigate();
  const { createEvent } = useCalendarEvents();
  const [isOpen, setIsOpen] = useState(false);

  const handleScheduleEvent = async (tipo_evento: string, titulo: string) => {
    try {
      await createEvent({
        tipo_evento,
        titulo,
        descripcion: `${titulo} programado`,
        fecha_inicio: new Date(),
        fecha_fin: new Date(Date.now() + 60 * 60 * 1000), // 1 hora después
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error al programar evento:', error);
    }
  };

  const handleNewTrip = () => {
    navigate('/cartas-porte');
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Programar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg">
        <DropdownMenuItem 
          onClick={() => handleScheduleEvent('mantenimiento', 'Mantenimiento Mecánico')}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
        >
          <Wrench className="h-4 w-4" />
          <span>Agendar Mantenimiento Mecánico</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleScheduleEvent('verificacion', 'Cita de Verificación')}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Cita de Verificación</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleScheduleEvent('revision_gps', 'Revisión GPS')}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
        >
          <MapPin className="h-4 w-4" />
          <span>Revisión GPS</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleNewTrip}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Viaje</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
