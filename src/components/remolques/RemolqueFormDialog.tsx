
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRemolques } from '@/hooks/useRemolques';
import { useStableVehiculos } from '@/hooks/useStableVehiculos';
import { useStableAuth } from '@/hooks/useStableAuth';
import { toast } from 'sonner';
import { Truck } from 'lucide-react';

interface RemolqueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remolque?: any;
  onSuccess?: () => void;
}

export function RemolqueFormDialog({ open, onOpenChange, remolque, onSuccess }: RemolqueFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useStableAuth();
  const { crearRemolque, actualizarRemolque } = useRemolques();
  const { vehiculos } = useStableVehiculos(user?.id);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (remolque) {
      setValue('placa', remolque.placa || '');
      setValue('marca', remolque.marca || '');
      setValue('modelo', remolque.modelo || '');
      setValue('anio', remolque.anio || '');
      setValue('num_serie', remolque.num_serie || '');
      setValue('tipo_remolque', remolque.tipo_remolque || '');
      setValue('subtipo_remolque', remolque.subtipo_remolque || '');
      setValue('autotransporte_id', remolque.autotransporte_id || '');
    } else {
      reset();
    }
  }, [remolque, setValue, reset]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const remolqueData = {
        placa: data.placa,
        marca: data.marca || '',
        modelo: data.modelo || '',
        anio: data.anio ? parseInt(data.anio) : undefined,
        num_serie: data.num_serie || '',
        tipo_remolque: data.tipo_remolque || '',
        subtipo_remolque: data.subtipo_remolque || '',
        estado: 'disponible',
        activo: true,
        autotransporte_id: data.autotransporte_id || undefined
      };

      if (remolque?.id) {
        await actualizarRemolque({ id: remolque.id, data: remolqueData });
        toast.success('Remolque actualizado exitosamente');
      } else {
        await crearRemolque(remolqueData);
        toast.success('Remolque creado exitosamente');
      }
      
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error('Error al guardar remolque: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {remolque ? 'Editar Remolque' : 'Nuevo Remolque'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="placa">Placa *</Label>
            <Input
              id="placa"
              {...register('placa', { required: 'La placa es requerida' })}
              placeholder="Placa del remolque"
            />
            {errors.placa && (
              <p className="text-sm text-red-500">{errors.placa.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                {...register('marca')}
                placeholder="Marca del remolque"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                {...register('modelo')}
                placeholder="Modelo del remolque"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                {...register('anio')}
                placeholder="2020"
                min="1900"
                max="2100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num_serie">Número de Serie</Label>
              <Input
                id="num_serie"
                {...register('num_serie')}
                placeholder="Número de serie"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_remolque">Tipo de Remolque</Label>
            <Select onValueChange={(value) => setValue('tipo_remolque', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caja_seca">Caja Seca</SelectItem>
                <SelectItem value="refrigerado">Refrigerado</SelectItem>
                <SelectItem value="tanque">Tanque</SelectItem>
                <SelectItem value="plataforma">Plataforma</SelectItem>
                <SelectItem value="tolva">Tolva</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="autotransporte_id">Vehículo Asignado</Label>
            <Select onValueChange={(value) => setValue('autotransporte_id', value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                {vehiculos.map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (remolque ? 'Actualizar' : 'Crear Remolque')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
