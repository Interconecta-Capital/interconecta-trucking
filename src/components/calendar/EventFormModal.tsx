import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  titulo: z.string().min(1, 'Requerido'),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  descripcion: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: Date | null;
  onSubmit: (data: { titulo: string; descripcion?: string; fecha_inicio: Date; fecha_fin: Date }) => Promise<void>;
}

export function EventFormModal({ open, onOpenChange, date, onSubmit }: EventFormModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: '',
      fecha_inicio: date ? date.toISOString().slice(0,16) : '',
      fecha_fin: date ? date.toISOString().slice(0,16) : '',
      descripcion: '',
    },
  });

  const handleSubmit = async (values: FormData) => {
    await onSubmit({
      titulo: values.titulo,
      descripcion: values.descripcion,
      fecha_inicio: new Date(values.fecha_inicio),
      fecha_fin: new Date(values.fecha_fin),
    });
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" {...form.register('titulo')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha_inicio">Inicio</Label>
            <Input id="fecha_inicio" type="datetime-local" {...form.register('fecha_inicio')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha_fin">Fin</Label>
            <Input id="fecha_fin" type="datetime-local" {...form.register('fecha_fin')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" {...form.register('descripcion')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
