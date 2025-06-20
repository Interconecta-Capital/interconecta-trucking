
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
import { MantenimientoFormModal } from '@/components/dashboard/MantenimientoFormModal';
import { VerificacionFormModal } from '@/components/dashboard/VerificacionFormModal';
import { RevisionGPSFormModal } from '@/components/dashboard/RevisionGPSFormModal';
import { CartaPorteFormModal } from '@/components/dashboard/CartaPorteFormModal';

export function ScheduleDropdown() {
  const navigate = useNavigate();
  const { createEvent } = useCalendarEvents();
  const [isOpen, setIsOpen] = useState(false);
  
  // Estados para los modales
  const [showMantenimientoForm, setShowMantenimientoForm] = useState(false);
  const [showVerificacionForm, setShowVerificacionForm] = useState(false);
  const [showRevisionGPSForm, setShowRevisionGPSForm] = useState(false);
  const [showCartaPorteForm, setShowCartaPorteForm] = useState(false);

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

  const handleMantenimientoClick = () => {
    setShowMantenimientoForm(true);
    setIsOpen(false);
  };

  const handleVerificacionClick = () => {
    setShowVerificacionForm(true);
    setIsOpen(false);
  };

  const handleRevisionGPSClick = () => {
    setShowRevisionGPSForm(true);
    setIsOpen(false);
  };

  const handleNewTrip = () => {
    setShowCartaPorteForm(true);
    setIsOpen(false);
  };

  return (
    <>
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
            onClick={handleMantenimientoClick}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
          >
            <Wrench className="h-4 w-4" />
            <span>Agendar Mantenimiento</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleVerificacionClick}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Cita de Verificación</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleRevisionGPSClick}
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

      {/* Modales */}
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

      <CartaPorteFormModal 
        open={showCartaPorteForm}
        onOpenChange={setShowCartaPorteForm}
      />
    </>
  );
}
