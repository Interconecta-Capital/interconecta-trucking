
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Truck } from 'lucide-react';

const vehiculoSchema = z.object({
  placa: z.string().min(1, 'La placa es requerida').max(10, 'Máximo 10 caracteres'),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  anio: z.number().optional(),
  num_serie: z.string().optional(),
  config_vehicular: z.string().optional(),
  poliza_seguro: z.string().optional(),
  vigencia_seguro: z.string().optional(),
});

type VehiculoFormData = z.infer<typeof vehiculoSchema>;

interface VehiculoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehiculoFormData) => Promise<void>;
  vehiculo?: any;
  loading?: boolean;
}

export function VehiculoFormModal({ open, onOpenChange, onSubmit, vehiculo, loading }: VehiculoFormModalProps) {
  const form = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: vehiculo ? {
      placa: vehiculo.placa || '',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      anio: vehiculo.anio || new Date().getFullYear(),
      num_serie: vehiculo.num_serie || '',
      config_vehicular: vehiculo.config_vehicular || '',
      poliza_seguro: vehiculo.poliza_seguro || '',
      vigencia_seguro: vehiculo.vigencia_seguro || '',
    } : {
      placa: '',
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      num_serie: '',
      config_vehicular: '',
      poliza_seguro: '',
      vigencia_seguro: '',
    },
  });

  const handleSubmit = async (data: VehiculoFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      toast.error('Error al guardar el vehículo');
    }
  };

  const configuracionesVehiculares = [
    'C2 - Camión Unitario (2 llantas en el eje delantero y 4 llantas en el eje trasero)',
    'C3 - Camión Unitario (2 llantas en el eje delantero y 6 llantas en el eje trasero)',
    'T3S2 - Tractocamión con Semirremolque',
    'T3S3 - Tractocamión con Semirremolque',
    'T3S2R4 - Tractocamión con Semirremolque y Remolque',
    'Otro'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </DialogTitle>
          <DialogDescription>
            {vehiculo ? 'Modifica los datos del vehículo' : 'Ingresa los datos del nuevo vehículo'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                {...form.register('placa')}
                placeholder="ABC-123"
                className="uppercase"
                onChange={(e) => {
                  form.setValue('placa', e.target.value.toUpperCase());
                }}
              />
              {form.formState.errors.placa && (
                <p className="text-sm text-red-500">{form.formState.errors.placa.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                {...form.register('marca')}
                placeholder="Ej: Volvo, Mercedes, Kenworth"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                {...form.register('modelo')}
                placeholder="Ej: FH16, Actros, T680"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                {...form.register('anio', { valueAsNumber: true })}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
            <Select 
              value={form.watch('config_vehicular')} 
              onValueChange={(value) => form.setValue('config_vehicular', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la configuración" />
              </SelectTrigger>
              <SelectContent>
                {configuracionesVehiculares.map((config) => (
                  <SelectItem key={config} value={config}>
                    {config}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_serie">Número de Serie</Label>
            <Input
              id="num_serie"
              {...form.register('num_serie')}
              placeholder="Número de serie del vehículo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poliza_seguro">Póliza de Seguro</Label>
              <Input
                id="poliza_seguro"
                {...form.register('poliza_seguro')}
                placeholder="Número de póliza"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vigencia_seguro">Vigencia del Seguro</Label>
              <Input
                id="vigencia_seguro"
                type="date"
                {...form.register('vigencia_seguro')}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Guardando...' : (vehiculo ? 'Actualizar' : 'Crear Vehículo')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
