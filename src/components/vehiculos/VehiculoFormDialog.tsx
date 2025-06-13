
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

interface VehiculoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehiculoFormDialog({ open, onOpenChange }: VehiculoFormDialogProps) {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    año: '',
    estado: 'disponible',
    activo: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Aquí iría la lógica para crear el vehículo
      toast.success('Vehículo creado exitosamente');
      onOpenChange(false);
      setFormData({
        placa: '',
        marca: '',
        modelo: '',
        año: '',
        estado: 'disponible',
        activo: true
      });
    } catch (error) {
      toast.error('Error al crear vehículo');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Vehículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="placa">Placa</Label>
            <Input
              id="placa"
              value={formData.placa}
              onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input
              id="marca"
              value={formData.marca}
              onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              value={formData.modelo}
              onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="año">Año</Label>
            <Input
              id="año"
              type="number"
              value={formData.año}
              onChange={(e) => setFormData({ ...formData, año: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              Crear Vehículo
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
