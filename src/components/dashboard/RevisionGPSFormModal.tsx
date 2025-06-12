
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useVehiculos } from '@/hooks/useVehiculos';

interface RevisionGPSFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RevisionGPSFormModal({ open, onOpenChange }: RevisionGPSFormModalProps) {
  const [fecha, setFecha] = useState<Date>();
  const [vehiculoId, setVehiculoId] = useState('');
  const [tipoServicio, setTipoServicio] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { vehiculos } = useVehiculos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha || !vehiculoId || !tipoServicio) {
      toast.error('Por favor complete los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      // Aquí iría la lógica para guardar la revisión GPS
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      
      toast.success('Revisión GPS programada exitosamente');
      onOpenChange(false);
      
      // Limpiar formulario
      setFecha(undefined);
      setVehiculoId('');
      setTipoServicio('');
      setProveedor('');
      setObservaciones('');
    } catch (error) {
      toast.error('Error al programar revisión GPS');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            Revisión/Instalación GPS
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehiculo">Vehículo *</Label>
            <Select value={vehiculoId} onValueChange={setVehiculoId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehiculos.map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha programada *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fecha && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={setFecha}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de servicio *</Label>
            <Select value={tipoServicio} onValueChange={setTipoServicio}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instalacion">Instalación GPS</SelectItem>
                <SelectItem value="revision">Revisión GPS</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento GPS</SelectItem>
                <SelectItem value="configuracion">Configuración GPS</SelectItem>
                <SelectItem value="reparacion">Reparación GPS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proveedor">Proveedor GPS</Label>
            <Input
              id="proveedor"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Nombre del proveedor GPS"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalles adicionales del servicio..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Programando...' : 'Programar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
