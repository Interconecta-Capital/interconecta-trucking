
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSocios } from '@/hooks/useSocios';
import { toast } from 'sonner';

interface SocioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SocioFormModal({ open, onOpenChange }: SocioFormModalProps) {
  const [loading, setLoading] = useState(false);
  const { crearSocio } = useSocios();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await crearSocio(data);
      toast.success('Socio creado exitosamente');
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al crear socio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuevo Socio</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_razon_social">Nombre/Razón Social *</Label>
              <Input
                id="nombre_razon_social"
                {...register('nombre_razon_social', { required: 'El nombre es requerido' })}
                placeholder="Nombre o razón social"
              />
              {errors.nombre_razon_social && (
                <p className="text-sm text-red-500">{errors.nombre_razon_social.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfc">RFC *</Label>
              <Input
                id="rfc"
                {...register('rfc', { required: 'El RFC es requerido' })}
                placeholder="RFC del socio"
              />
              {errors.rfc && (
                <p className="text-sm text-red-500">{errors.rfc.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_persona">Tipo de Persona</Label>
              <Select onValueChange={(value) => setValue('tipo_persona', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Persona Física</SelectItem>
                  <SelectItem value="moral">Persona Moral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                {...register('telefono')}
                placeholder="Teléfono de contacto"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Email del socio"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Socio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
