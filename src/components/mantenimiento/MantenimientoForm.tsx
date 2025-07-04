
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMantenimientoPredictivo } from '@/hooks/useMantenimientoPredictivo';
import { toast } from 'sonner';

interface MantenimientoFormProps {
  vehiculos: any[];
  talleres: any[];
  onClose: () => void;
  mantenimientoId?: string;
}

export const MantenimientoForm: React.FC<MantenimientoFormProps> = ({
  vehiculos,
  talleres,
  onClose,
  mantenimientoId
}) => {
  const { crearMantenimiento, actualizarMantenimiento } = useMantenimientoPredictivo();
  const [isLoading, setIsLoading] = useState(false);
  const [fecha, setFecha] = useState<Date>();
  const [formData, setFormData] = useState({
    vehiculo_id: '',
    tipo_mantenimiento: '',
    descripcion: '',
    kilometraje_programado: '',
    costo_estimado: '',
    taller_id: ''
  });

  const tiposMantenimiento = [
    { value: 'preventivo', label: 'Preventivo' },
    { value: 'correctivo', label: 'Correctivo' },
    { value: 'revision', label: 'Revisión' },
    { value: 'emergencia', label: 'Emergencia' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fecha) {
      toast.error('Selecciona una fecha de programación');
      return;
    }

    setIsLoading(true);
    
    try {
      const data = {
        ...formData,
        fecha_programada: format(fecha, 'yyyy-MM-dd'),
        kilometraje_programado: formData.kilometraje_programado ? parseInt(formData.kilometraje_programado) : undefined,
        costo_estimado: formData.costo_estimado ? parseFloat(formData.costo_estimado) : undefined
      };

      if (mantenimientoId) {
        await actualizarMantenimiento(mantenimientoId, data);
        toast.success('Mantenimiento actualizado correctamente');
      } else {
        await crearMantenimiento(data);
        toast.success('Mantenimiento programado correctamente');
      }
      
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al programar mantenimiento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mantenimientoId ? 'Editar Mantenimiento' : 'Programar Mantenimiento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehiculo">Vehículo</Label>
              <Select 
                value={formData.vehiculo_id} 
                onValueChange={(value) => handleInputChange('vehiculo_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehiculos.map((vehiculo) => (
                    <SelectItem key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.placa} - {vehiculo.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Mantenimiento</Label>
              <Select 
                value={formData.tipo_mantenimiento} 
                onValueChange={(value) => handleInputChange('tipo_mantenimiento', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposMantenimiento.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción del Servicio</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe el mantenimiento a realizar..."
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Fecha Programada</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
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
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kilometraje">Kilometraje Programado</Label>
              <Input
                id="kilometraje"
                type="number"
                placeholder="150000"
                value={formData.kilometraje_programado}
                onChange={(e) => handleInputChange('kilometraje_programado', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costo">Costo Estimado</Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                placeholder="2500.00"
                value={formData.costo_estimado}
                onChange={(e) => handleInputChange('costo_estimado', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taller">Taller (Opcional)</Label>
            <Select 
              value={formData.taller_id} 
              onValueChange={(value) => handleInputChange('taller_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar taller" />
              </SelectTrigger>
              <SelectContent>
                {talleres.map((taller) => (
                  <SelectItem key={taller.id} value={taller.id}>
                    {taller.nombre} - ⭐ {taller.calificacion_promedio.toFixed(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : mantenimientoId ? 'Actualizar' : 'Programar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
