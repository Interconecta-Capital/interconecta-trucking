
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const vehiculoSchema = z.object({
  placa: z.string().min(1, 'Placa es requerida'),
  marca: z.string().min(1, 'Marca es requerida'),
  modelo: z.string().min(1, 'Modelo es requerido'),
  anio: z.number().min(1900).max(new Date().getFullYear() + 1),
  num_serie: z.string().optional(),
  config_vehicular: z.string().optional(),
  poliza_seguro: z.string().optional(),
  vigencia_seguro: z.string().optional(),
  verificacion_vigencia: z.string().optional()
});

type VehiculoFormData = z.infer<typeof vehiculoSchema>;

interface VehiculoFormAdvancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehiculoFormData) => Promise<void>;
  vehiculo?: any;
  loading?: boolean;
}

export function VehiculoFormAdvanced({ 
  open, 
  onOpenChange, 
  onSubmit, 
  vehiculo,
  loading = false 
}: VehiculoFormAdvancedProps) {
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      placa: '',
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      num_serie: '',
      config_vehicular: '',
      poliza_seguro: '',
      vigencia_seguro: '',
      verificacion_vigencia: ''
    }
  });

  // Reset form when vehiculo data changes
  useEffect(() => {
    if (vehiculo && open) {
      reset({
        placa: vehiculo.placa || '',
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        anio: vehiculo.anio || new Date().getFullYear(),
        num_serie: vehiculo.num_serie || '',
        config_vehicular: vehiculo.config_vehicular || '',
        poliza_seguro: vehiculo.poliza_seguro || '',
        vigencia_seguro: vehiculo.vigencia_seguro ? new Date(vehiculo.vigencia_seguro).toISOString().split('T')[0] : '',
        verificacion_vigencia: vehiculo.verificacion_vigencia ? new Date(vehiculo.verificacion_vigencia).toISOString().split('T')[0] : ''
      });
    } else if (!vehiculo && open) {
      reset({
        placa: '',
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        num_serie: '',
        config_vehicular: '',
        poliza_seguro: '',
        vigencia_seguro: '',
        verificacion_vigencia: ''
      });
    }
  }, [vehiculo, open, reset]);

  const handleFormSubmit = async (data: VehiculoFormData) => {
    try {
      setSubmitting(true);
      await onSubmit(data);
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      toast.error('Error al guardar el vehículo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="placa">Placa *</Label>
              <Controller
                name="placa"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field} 
                    placeholder="Ingresa la placa"
                    className={errors.placa ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.placa && (
                <p className="text-sm text-red-500 mt-1">{errors.placa.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="marca">Marca *</Label>
              <Controller
                name="marca"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field} 
                    placeholder="Ingresa la marca"
                    className={errors.marca ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.marca && (
                <p className="text-sm text-red-500 mt-1">{errors.marca.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="modelo">Modelo *</Label>
              <Controller
                name="modelo"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field} 
                    placeholder="Ingresa el modelo"
                    className={errors.modelo ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.modelo && (
                <p className="text-sm text-red-500 mt-1">{errors.modelo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="anio">Año *</Label>
              <Controller
                name="anio"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field} 
                    type="number"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    placeholder="Año del vehículo"
                    className={errors.anio ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.anio && (
                <p className="text-sm text-red-500 mt-1">{errors.anio.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="num_serie">Número de Serie</Label>
              <Controller
                name="num_serie"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field} 
                    placeholder="Número de serie"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
              <Controller
                name="config_vehicular"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona configuración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C2">C2 - Camión de 2 ejes</SelectItem>
                      <SelectItem value="C3">C3 - Camión de 3 ejes</SelectItem>
                      <SelectItem value="T3S2">T3S2 - Tractocamión con semirremolque</SelectItem>
                      <SelectItem value="T3S3">T3S3 - Tractocamión con semirremolque</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="poliza_seguro">Póliza de Seguro</Label>
              <Controller
                name="poliza_seguro"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field} 
                    placeholder="Número de póliza"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="vigencia_seguro">Vigencia del Seguro</Label>
              <Controller
                name="vigencia_seguro"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field} 
                    type="date"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="verificacion_vigencia">Vigencia de Verificación</Label>
              <Controller
                name="verificacion_vigencia"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field} 
                    type="date"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={submitting || loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || loading}
            >
              {submitting ? 'Guardando...' : vehiculo ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
