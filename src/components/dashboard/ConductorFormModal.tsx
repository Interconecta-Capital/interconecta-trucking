import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConductores } from '@/hooks/useConductores';
import { toast } from 'sonner';

interface ConductorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConductorFormModal({ open, onOpenChange }: ConductorFormModalProps) {
  const [loading, setLoading] = useState(false);
  const { createConductor } = useConductores();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createConductor(data);
      toast.success('Conductor creado exitosamente');
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al crear conductor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuevo Conductor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                {...register('nombre', { required: 'El nombre es requerido' })}
                placeholder="Nombre del conductor"
              />
              {errors.nombre && (
                <p className="text-sm text-red-500">{errors.nombre.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfc">RFC</Label>
              <Input
                id="rfc"
                {...register('rfc')}
                placeholder="RFC del conductor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="curp">CURP</Label>
              <Input
                id="curp"
                {...register('curp')}
                placeholder="CURP del conductor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                {...register('telefono')}
                placeholder="Teléfono de contacto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Email del conductor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num_licencia">Número de Licencia</Label>
              <Input
                id="num_licencia"
                {...register('num_licencia')}
                placeholder="Número de licencia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_licencia">Tipo de Licencia</Label>
              <Select onValueChange={(value) => setValue('tipo_licencia', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Tipo A</SelectItem>
                  <SelectItem value="B">Tipo B</SelectItem>
                  <SelectItem value="C">Tipo C</SelectItem>
                  <SelectItem value="D">Tipo D</SelectItem>
                  <SelectItem value="E">Tipo E</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vigencia_licencia">Vigencia de Licencia</Label>
              <Input
                id="vigencia_licencia"
                type="date"
                {...register('vigencia_licencia')}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Conductor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
