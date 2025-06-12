
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
import { useConductores } from '@/hooks/useConductores';
import { toast } from 'sonner';
import { Plus, Users } from 'lucide-react';

const conductorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  rfc: z.string().optional(),
  curp: z.string().optional(),
  num_licencia: z.string().min(1, 'El número de licencia es requerido'),
  tipo_licencia: z.string().min(1, 'El tipo de licencia es requerido'),
  vigencia_licencia: z.string().min(1, 'La vigencia de licencia es requerida'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional(),
});

type ConductorFormData = z.infer<typeof conductorSchema>;

interface ConductorFormModalProps {
  trigger?: React.ReactNode;
  conductor?: any;
  onSuccess?: () => void;
}

export function ConductorFormModal({ trigger, conductor, onSuccess }: ConductorFormModalProps) {
  const [open, setOpen] = useState(false);
  const { crearConductor, actualizarConductor, isCreating, isUpdating } = useConductores();

  const form = useForm<ConductorFormData>({
    resolver: zodResolver(conductorSchema),
    defaultValues: conductor ? {
      nombre: conductor.nombre,
      rfc: conductor.rfc || '',
      curp: conductor.curp || '',
      num_licencia: conductor.num_licencia || '',
      tipo_licencia: conductor.tipo_licencia || '',
      vigencia_licencia: conductor.vigencia_licencia || '',
      telefono: conductor.telefono || '',
      email: conductor.email || '',
    } : {
      nombre: '',
      rfc: '',
      curp: '',
      num_licencia: '',
      tipo_licencia: '',
      vigencia_licencia: '',
      telefono: '',
      email: '',
    },
  });

  const onSubmit = async (data: ConductorFormData) => {
    try {
      if (conductor) {
        await actualizarConductor({ id: conductor.id, ...data });
      } else {
        await crearConductor(data);
      }
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Error al guardar el conductor');
    }
  };

  const tiposLicencia = [
    'A - Motocicletas y ciclomotores',
    'B - Automóviles y camionetas',
    'C - Camiones y autobuses',
    'D - Vehículos articulados',
    'E - Remolques y semirremolques'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Conductor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {conductor ? 'Editar Conductor' : 'Nuevo Conductor'}
          </DialogTitle>
          <DialogDescription>
            {conductor ? 'Modifica los datos del conductor' : 'Ingresa los datos del nuevo conductor'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              {...form.register('nombre')}
              placeholder="Nombre completo del conductor"
            />
            {form.formState.errors.nombre && (
              <p className="text-sm text-red-500">{form.formState.errors.nombre.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rfc">RFC</Label>
              <Input
                id="rfc"
                {...form.register('rfc')}
                placeholder="RFC del conductor"
                className="uppercase"
                onChange={(e) => {
                  form.setValue('rfc', e.target.value.toUpperCase());
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="curp">CURP</Label>
              <Input
                id="curp"
                {...form.register('curp')}
                placeholder="CURP del conductor"
                className="uppercase"
                onChange={(e) => {
                  form.setValue('curp', e.target.value.toUpperCase());
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="num_licencia">Número de Licencia *</Label>
              <Input
                id="num_licencia"
                {...form.register('num_licencia')}
                placeholder="Número de licencia"
              />
              {form.formState.errors.num_licencia && (
                <p className="text-sm text-red-500">{form.formState.errors.num_licencia.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_licencia">Tipo de Licencia *</Label>
              <Select 
                value={form.watch('tipo_licencia')} 
                onValueChange={(value) => form.setValue('tipo_licencia', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposLicencia.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.tipo_licencia && (
                <p className="text-sm text-red-500">{form.formState.errors.tipo_licencia.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vigencia_licencia">Vigencia de Licencia *</Label>
            <Input
              id="vigencia_licencia"
              type="date"
              {...form.register('vigencia_licencia')}
            />
            {form.formState.errors.vigencia_licencia && (
              <p className="text-sm text-red-500">{form.formState.errors.vigencia_licencia.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                {...form.register('telefono')}
                placeholder="Número de teléfono"
              />
              {form.formState.errors.telefono && (
                <p className="text-sm text-red-500">{form.formState.errors.telefono.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="correo@ejemplo.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating || isUpdating ? 'Guardando...' : (conductor ? 'Actualizar' : 'Crear Conductor')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
