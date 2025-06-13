
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

interface SocioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SocioFormDialog({ open, onOpenChange }: SocioFormDialogProps) {
  const [formData, setFormData] = useState({
    nombre_razon_social: '',
    rfc: '',
    email: '',
    telefono: '',
    estado: 'activo',
    activo: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Aquí iría la lógica para crear el socio
      toast.success('Socio creado exitosamente');
      onOpenChange(false);
      setFormData({
        nombre_razon_social: '',
        rfc: '',
        email: '',
        telefono: '',
        estado: 'activo',
        activo: true
      });
    } catch (error) {
      toast.error('Error al crear socio');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Socio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_razon_social">Nombre/Razón Social</Label>
            <Input
              id="nombre_razon_social"
              value={formData.nombre_razon_social}
              onChange={(e) => setFormData({ ...formData, nombre_razon_social: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              value={formData.rfc}
              onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
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
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              Crear Socio
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
