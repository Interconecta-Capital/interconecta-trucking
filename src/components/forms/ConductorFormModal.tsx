
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
import { Plus, User } from 'lucide-react';

const conductorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  rfc: z.string().optional(),
  curp: z.string().optional(),
  num_licencia: z.string().optional(),
  tipo_licencia: z.string().optional(),
  vigencia_licencia: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type ConductorFormData = z.infer<typeof conductorSchema>;

interface ConductorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ConductorFormData) => Promise<void>;
  conductor?: any;
  loading?: boolean;
}

export function ConductorFormModal({ open, onOpenChange, onSubmit, conductor, loading }: ConductorFormModalProps) {
  const form = useForm<ConductorFormData>({
    resolver: zodResolver(conductorSchema),
    defaultValues: conductor ? {
      nombre: conductor.nombre || '',
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

  const handleSubmit = async (data: ConductorFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      toast.error('Error al guardar el conductor');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {conductor ? 'Editar Conductor' : 'Nuevo Conductor'}
          </DialogTitle>
          <DialogDescription>
            {conductor ? 'Modifica los datos del conductor' : 'Ingresa los datos del nuevo conductor'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              {...form.register('nombre')}
              placeholder="Nombre del conductor"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="num_licencia">Número de Licencia</Label>
              <Input
                id="num_licencia"
                {...form.register('num_licencia')}
                placeholder="Número de licencia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_licencia">Tipo de Licencia</Label>
              <Select 
                value={form.watch('tipo_licencia')} 
                onValueChange={(value) => form.setValue('tipo_licencia', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="vigencia_licencia">Vigencia de Licencia</Label>
            <Input
              id="vigencia_licencia"
              type="date"
              {...form.register('vigencia_licencia')}
            />
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
              {loading ? 'Guardando...' : (conductor ? 'Actualizar' : 'Crear Conductor')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
