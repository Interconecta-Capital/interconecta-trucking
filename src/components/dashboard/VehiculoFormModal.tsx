
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVehiculos } from '@/hooks/useVehiculos';
import { toast } from 'sonner';

interface VehiculoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehiculoFormModal({ open, onOpenChange }: VehiculoFormModalProps) {
  const [loading, setLoading] = useState(false);
  const { crearVehiculo } = useVehiculos();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Limpiar formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: any) => {
    if (loading) return; // Prevenir envíos duplicados
    
    setLoading(true);
    try {
      console.log('[VehiculoFormModal] Creating vehicle with data:', data);
      
      // Procesar datos antes de enviar
      const vehiculoData = {
        ...data,
        estado: data.estado || 'disponible',
        activo: true,
        // Convertir año a número si existe
        anio: data.anio ? parseInt(data.anio) : null,
      };

      await crearVehiculo(vehiculoData);
      toast.success('Vehículo creado exitosamente');
      reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('[VehiculoFormModal] Error creating vehicle:', error);
      toast.error('Error al crear vehículo: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Vehículo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                {...register('placa', { 
                  required: 'La placa es requerida',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                })}
                placeholder="Número de placa"
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                {...register('modelo')}
                placeholder="Modelo del vehículo"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                min="1900"
                max="2030"
                {...register('anio')}
                placeholder="Año del vehículo"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num_serie">Número de Serie</Label>
              <Input
                id="num_serie"
                {...register('num_serie')}
                placeholder="Número de serie/VIN"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select onValueChange={(value) => setValue('estado', value)} defaultValue="disponible">
                <SelectTrigger disabled={loading}>
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
              <Label htmlFor="poliza_seguro">Póliza de Seguro</Label>
              <Input
                id="poliza_seguro"
                {...register('poliza_seguro')}
                placeholder="Número de póliza"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vigencia_seguro">Vigencia del Seguro</Label>
              <Input
                id="vigencia_seguro"
                type="date"
                {...register('vigencia_seguro')}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificacion_vigencia">Vigencia Verificación</Label>
              <Input
                id="verificacion_vigencia"
                type="date"
                {...register('verificacion_vigencia')}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
              <Input
                id="config_vehicular"
                {...register('config_vehicular')}
                placeholder="Configuración del vehículo"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
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
