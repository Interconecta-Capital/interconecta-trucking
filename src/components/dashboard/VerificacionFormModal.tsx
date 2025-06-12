
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useVehiculos } from '@/hooks/useVehiculos';

interface VerificacionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerificacionFormModal({ open, onOpenChange }: VerificacionFormModalProps) {
  const [fecha, setFecha] = useState<Date>();
  const [vehiculoId, setVehiculoId] = useState('');
  const [tipoVerificacion, setTipoVerificacion] = useState('');
  const [centro, setCentro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { vehiculos } = useVehiculos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha || !vehiculoId || !tipoVerificacion) {
      toast.error('Por favor complete los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      // Aquí iría la lógica para guardar la verificación
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      
      toast.success('Verificación programada exitosamente');
      onOpenChange(false);
      
      // Limpiar formulario
      setFecha(undefined);
      setVehiculoId('');
      setTipoVerificacion('');
      setCentro('');
    } catch (error) {
      toast.error('Error al programar verificación');
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
            <CheckCircle className="h-5 w-5 text-orange-600" />
            Programar Verificación
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
            <Label htmlFor="tipo">Tipo de verificación *</Label>
            <Select value={tipoVerificacion} onValueChange={setTipoVerificacion}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vehicular">Verificación Vehicular</SelectItem>
                <SelectItem value="emisiones">Verificación de Emisiones</SelectItem>
                <SelectItem value="fisica_mecanica">Verificación Física-Mecánica</SelectItem>
                <SelectItem value="sct">Verificación SCT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="centro">Centro de verificación</Label>
            <Input
              id="centro"
              value={centro}
              onChange={(e) => setCentro(e.target.value)}
              placeholder="Nombre del centro de verificación"
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
