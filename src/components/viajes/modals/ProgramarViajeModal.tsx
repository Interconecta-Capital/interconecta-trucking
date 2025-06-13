
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';

interface ProgramarViajeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProgramarViajeModal({ open, onOpenChange }: ProgramarViajeModalProps) {
  const [formData, setFormData] = useState({
    cartaPorteId: '',
    origen: '',
    destino: '',
    fechaProgramada: '',
    observaciones: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Programando viaje:', formData);
    // Aquí se implementaría la lógica para programar el viaje
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programar Nuevo Viaje
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cartaPorte">Carta Porte ID</Label>
            <Input
              id="cartaPorte"
              value={formData.cartaPorteId}
              onChange={(e) => setFormData({ ...formData, cartaPorteId: e.target.value })}
              placeholder="CP-001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="origen">Origen</Label>
            <Input
              id="origen"
              value={formData.origen}
              onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
              placeholder="Ciudad de origen"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destino">Destino</Label>
            <Input
              id="destino"
              value={formData.destino}
              onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
              placeholder="Ciudad de destino"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha Programada</Label>
            <Input
              id="fecha"
              type="datetime-local"
              value={formData.fechaProgramada}
              onChange={(e) => setFormData({ ...formData, fechaProgramada: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Programar Viaje
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
