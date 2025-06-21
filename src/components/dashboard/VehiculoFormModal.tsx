
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { useVehiculos } from '@/hooks/useVehiculos';
import { toast } from 'sonner';
import { Truck, IdCard, Shield, Calendar } from 'lucide-react';

interface VehiculoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehiculoFormModal({ open, onOpenChange }: VehiculoFormModalProps) {
  const [loading, setLoading] = useState(false);
  const { crearVehiculo } = useVehiculos();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: any) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const vehiculoData = {
        ...data,
        estado: data.estado || 'disponible',
        activo: true,
        anio: data.anio ? parseInt(data.anio) : null,
      };

      await crearVehiculo(vehiculoData);
      toast.success('Vehículo creado exitosamente');
      reset();
      onOpenChange(false);
    } catch (error: any) {
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <SectionHeader
            title="Nuevo Vehículo"
            description="Registra un nuevo vehículo en el sistema"
            icon={Truck}
            className="border-0 pb-0"
          />
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-blue-interconecta" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className={errors.placa ? 'border-red-300' : ''}
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
                <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
                <Input
                  id="config_vehicular"
                  {...register('config_vehicular')}
                  placeholder="Configuración del vehículo"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Documentos e Identificación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IdCard className="h-5 w-5 text-blue-interconecta" />
                Documentos e Identificación
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="poliza_seguro">Póliza de Seguro</Label>
                <Input
                  id="poliza_seguro"
                  {...register('poliza_seguro')}
                  placeholder="Número de póliza"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vigencias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-interconecta" />
                Vigencias
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-20">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Guardando...' : 'Guardar Vehículo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
