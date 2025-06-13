
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useConductores } from '@/hooks/useConductores';
import { toast } from 'sonner';

interface ConductorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConductorFormDialog({ open, onOpenChange }: ConductorFormDialogProps) {
  const { crearConductor, isCreating } = useConductores();
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    curp: '',
    telefono: '',
    email: '',
    num_licencia: '',
    tipo_licencia: '',
    estado: 'disponible',
    activo: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearConductor(formData);
      onOpenChange(false);
      setFormData({
        nombre: '',
        rfc: '',
        curp: '',
        telefono: '',
        email: '',
        num_licencia: '',
        tipo_licencia: '',
        estado: 'disponible',
        activo: true
      });
    } catch (error) {
      toast.error('Error al crear conductor');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Conductor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              value={formData.rfc}
              onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="num_licencia">Número de Licencia</Label>
            <Input
              id="num_licencia"
              value={formData.num_licencia}
              onChange={(e) => setFormData({ ...formData, num_licencia: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creando...' : 'Crear Conductor'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
