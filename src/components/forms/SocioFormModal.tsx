
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
import { useSocios } from '@/hooks/useSocios';
import { toast } from 'sonner';
import { Plus, Building } from 'lucide-react';

const socioSchema = z.object({
  nombre_razon_social: z.string().min(1, 'El nombre o razón social es requerido'),
  rfc: z.string().min(1, 'El RFC es requerido').max(13, 'RFC inválido'),
  tipo_persona: z.enum(['fisica', 'moral'], {
    required_error: 'Selecciona el tipo de persona',
  }),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type SocioFormData = z.infer<typeof socioSchema>;

interface SocioFormModalProps {
  trigger?: React.ReactNode;
  socio?: any;
  onSuccess?: () => void;
}

export function SocioFormModal({ trigger, socio, onSuccess }: SocioFormModalProps) {
  const [open, setOpen] = useState(false);
  const { crearSocio, updateSocio, isCreating, isUpdating } = useSocios();

  const form = useForm<SocioFormData>({
    resolver: zodResolver(socioSchema),
    defaultValues: socio ? {
      nombre_razon_social: socio.nombre_razon_social || '',
      rfc: socio.rfc || '',
      tipo_persona: socio.tipo_persona || 'moral',
      telefono: socio.telefono || '',
      email: socio.email || '',
    } : {
      nombre_razon_social: '',
      rfc: '',
      tipo_persona: 'moral',
      telefono: '',
      email: '',
    },
  });

  const onSubmit = async (data: SocioFormData) => {
    try {
      // Ensure required fields are present and convert to proper format
      const socioData = {
        nombre_razon_social: data.nombre_razon_social,
        rfc: data.rfc,
        tipo_persona: data.tipo_persona,
        telefono: data.telefono || undefined,
        email: data.email || undefined,
      };

      if (socio) {
        await updateSocio({ id: socio.id, ...socioData });
      } else {
        await crearSocio(socioData);
      }
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Error al guardar el socio');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Socio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {socio ? 'Editar Socio' : 'Nuevo Socio'}
          </DialogTitle>
          <DialogDescription>
            {socio ? 'Modifica los datos del socio' : 'Ingresa los datos del nuevo socio comercial'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_razon_social">Nombre / Razón Social *</Label>
            <Input
              id="nombre_razon_social"
              {...form.register('nombre_razon_social')}
              placeholder="Nombre completo o razón social"
            />
            {form.formState.errors.nombre_razon_social && (
              <p className="text-sm text-red-500">{form.formState.errors.nombre_razon_social.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rfc">RFC *</Label>
              <Input
                id="rfc"
                {...form.register('rfc')}
                placeholder="RFC del socio"
                className="uppercase"
                onChange={(e) => {
                  form.setValue('rfc', e.target.value.toUpperCase());
                }}
              />
              {form.formState.errors.rfc && (
                <p className="text-sm text-red-500">{form.formState.errors.rfc.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_persona">Tipo de Persona *</Label>
              <Select 
                value={form.watch('tipo_persona')} 
                onValueChange={(value: 'fisica' | 'moral') => form.setValue('tipo_persona', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Persona Física</SelectItem>
                  <SelectItem value="moral">Persona Moral</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.tipo_persona && (
                <p className="text-sm text-red-500">{form.formState.errors.tipo_persona.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                {...form.register('telefono')}
                placeholder="Número de teléfono"
              />
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
              {isCreating || isUpdating ? 'Guardando...' : (socio ? 'Actualizar' : 'Crear Socio')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
