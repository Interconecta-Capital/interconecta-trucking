
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Clock, CheckCircle, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: {
      tipo_evento: string;
      descripcion?: string;
      ubicacion_origen?: string;
      ubicacion_destino?: string;
      metadata?: any;
    };
  } | null;
}

export function EventManagementModal({ open, onOpenChange, event }: EventManagementModalProps) {
  const [newStatus, setNewStatus] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) return null;

  const handleStatusChange = async (action: string) => {
    setIsSubmitting(true);
    try {
      // Simulación de actualización de estado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let message = '';
      switch (action) {
        case 'completar':
          message = `${event.title} marcado como completado`;
          break;
        case 'cancelar':
          message = `${event.title} cancelado`;
          break;
        case 'reagendar':
          message = `${event.title} reagendado`;
          break;
        default:
          message = `Estado de ${event.title} actualizado`;
      }
      
      toast.success(message);
      onOpenChange(false);
    } catch (error) {
      toast.error('Error al actualizar el evento');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (tipo: string) => {
    switch (tipo) {
      case 'viaje':
        return <Badge className="bg-green-100 text-green-800">Viaje</Badge>;
      case 'mantenimiento':
        return <Badge className="bg-red-100 text-red-800">Mantenimiento</Badge>;
      case 'verificacion':
        return <Badge className="bg-orange-100 text-orange-800">Verificación</Badge>;
      case 'revision_gps':
        return <Badge className="bg-purple-100 text-purple-800">Revisión GPS</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Evento</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Gestionar Evento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg">{event.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(event.resource.tipo_evento)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(event.start, "PPP 'a las' HH:mm", { locale: es })}
              </span>
            </div>
            {event.end && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Hasta: {format(event.end, "PPP 'a las' HH:mm", { locale: es })}
                </span>
              </div>
            )}
          </div>

          {event.resource.descripcion && (
            <div>
              <Label className="text-sm font-medium">Descripción</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {event.resource.descripcion}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Agregar observaciones sobre el cambio de estado..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleStatusChange('completar')}
              disabled={isSubmitting}
            >
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Completar
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleStatusChange('cancelar')}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2 text-red-600" />
              Cancelar
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start col-span-2"
              onClick={() => handleStatusChange('reagendar')}
              disabled={isSubmitting}
            >
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              Reagendar
            </Button>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
