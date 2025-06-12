
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVehiculos } from '@/hooks/useVehiculos';
import { toast } from 'sonner';

interface VehiculoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehiculoFormModal({ open, onOpenChange }: VehiculoFormModalProps) {
  const [loading, setLoading] = useState(false);
  const { crearVehiculo } = useVehiculos();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await crearVehiculo(data);
      toast.success('Vehículo creado exitosamente');
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al crear vehículo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuevo Vehículo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                {...register('placa', { required: 'La placa es requerida' })}
                placeholder="Número de placa"
              />
              {errors.placa && (
                <p className="text-sm text-red-500">{errors.placa.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                {...register('marca')}
                placeholder="Marca del vehículo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                {...register('modelo')}
                placeholder="Modelo del vehículo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                {...register('anio')}
                placeholder="Año del vehículo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num_serie">Número de Serie</Label>
              <Input
                id="num_serie"
                {...register('num_serie')}
                placeholder="Número de serie/VIN"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poliza_seguro">Póliza de Seguro</Label>
              <Input
                id="poliza_seguro"
                {...register('poliza_seguro')}
                placeholder="Número de póliza"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vigencia_seguro">Vigencia del Seguro</Label>
              <Input
                id="vigencia_seguro"
                type="date"
                {...register('vigencia_seguro')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificacion_vigencia">Vigencia Verificación</Label>
              <Input
                id="verificacion_vigencia"
                type="date"
                {...register('verificacion_vigencia')}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Vehículo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
