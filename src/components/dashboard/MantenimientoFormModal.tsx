
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useVehiculos } from '@/hooks/useVehiculos';

interface MantenimientoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MantenimientoFormModal({ open, onOpenChange }: MantenimientoFormModalProps) {
  const [fecha, setFecha] = useState<Date>();
  const [vehiculoId, setVehiculoId] = useState('');
  const [tipoMantenimiento, setTipoMantenimiento] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [costoEstimado, setCostoEstimado] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { vehiculos } = useVehiculos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha || !vehiculoId || !tipoMantenimiento) {
      toast.error('Por favor complete los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      // Aquí iría la lógica para guardar el mantenimiento
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      
      toast.success('Mantenimiento programado exitosamente');
      onOpenChange(false);
      
      // Limpiar formulario
      setFecha(undefined);
      setVehiculoId('');
      setTipoMantenimiento('');
      setDescripcion('');
      setProveedor('');
      setCostoEstimado('');
    } catch (error) {
      toast.error('Error al programar mantenimiento');
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
            <Wrench className="h-5 w-5 text-red-600" />
            Programar Mantenimiento
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
            <Label htmlFor="tipo">Tipo de mantenimiento *</Label>
            <Select value={tipoMantenimiento} onValueChange={setTipoMantenimiento}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventivo">Preventivo</SelectItem>
                <SelectItem value="correctivo">Correctivo</SelectItem>
                <SelectItem value="cambio_aceite">Cambio de aceite</SelectItem>
                <SelectItem value="revision_frenos">Revisión de frenos</SelectItem>
                <SelectItem value="cambio_llantas">Cambio de llantas</SelectItem>
                <SelectItem value="revision_motor">Revisión de motor</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proveedor">Proveedor/Taller</Label>
            <Input
              id="proveedor"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Nombre del taller o proveedor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costo">Costo estimado</Label>
            <Input
              id="costo"
              type="number"
              value={costoEstimado}
              onChange={(e) => setCostoEstimado(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles del mantenimiento a realizar..."
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
