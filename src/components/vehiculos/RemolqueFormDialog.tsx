
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  const { crearRemolque, actualizarRemolque } = useRemolques(user?.id);
  const { vehiculos } = useStableVehiculos(user?.id);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (remolque) {
      setValue('placa', remolque.placa || '');
      setValue('marca', remolque.marca || '');
      setValue('modelo', remolque.modelo || '');
      setValue('anio', remolque.anio || '');
      setValue('num_serie', remolque.num_serie || '');
      setValue('tipo_remolque', remolque.tipo_remolque || '');
      setValue('capacidad_carga', remolque.capacidad_carga || '');
      setValue('estado', remolque.estado || 'disponible');
      setValue('vehiculo_asignado_id', remolque.vehiculo_asignado_id || '');
    } else {
      reset();
    }
  }, [remolque, setValue, reset]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const remolqueData = {
        ...data,
        anio: data.anio ? parseInt(data.anio) : null,
        capacidad_carga: data.capacidad_carga ? parseFloat(data.capacidad_carga) : null,
        vehiculo_asignado_id: data.vehiculo_asignado_id || null,
        user_id: user?.id
      };

      if (remolque?.id) {
        await actualizarRemolque(remolque.id, remolqueData);
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {remolque ? 'Editar Remolque' : 'Nuevo Remolque'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select onValueChange={(value) => setValue('estado', value)} defaultValue="disponible">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="en_uso">En Uso</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="fuera_servicio">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                {...register('anio')}
                placeholder="Año del remolque"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidad_carga">Capacidad de Carga (kg)</Label>
              <Input
                id="capacidad_carga"
                type="number"
                {...register('capacidad_carga')}
                placeholder="Capacidad en kilogramos"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="num_serie">Número de Serie</Label>
              <Input
                id="num_serie"
                {...register('num_serie')}
                placeholder="Número de serie del remolque"
              />
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
              <Label htmlFor="vehiculo_asignado_id">Vehículo Asignado</Label>
              <Select onValueChange={(value) => setValue('vehiculo_asignado_id', value || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {vehiculos.map((vehiculo) => (
                    <SelectItem key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
