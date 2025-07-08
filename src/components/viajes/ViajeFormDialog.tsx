
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useViajes } from '@/hooks/useViajes';
import { toast } from 'sonner';
import { Navigation } from 'lucide-react';

interface ViajeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ViajeFormDialog({ open, onOpenChange, onSuccess }: ViajeFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const { crearViaje } = useViajes();
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    fecha_programada: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.origen || !formData.destino) {
      toast.error('Origen y destino son requeridos');
      return;
    }

    setLoading(true);
    
    try {
      // Create a basic wizard data structure for the viaje
      const wizardData = {
        currentStep: 0,
        isValid: true,
        origen: {
          domicilio: {
            calle: formData.origen
          },
          fechaHoraSalidaLlegada: formData.fecha_programada || new Date().toISOString()
        },
        destino: {
          domicilio: {
            calle: formData.destino
          },
          fechaHoraSalidaLlegada: formData.fecha_programada || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        cliente: {
          nombre_razon_social: 'Cliente Básico',
          rfc: 'XAXX010101000'
        },
        distanciaRecorrida: 0
      };

      // Usar la función corregida que retorna Promise
      await crearViaje(wizardData);
      
      setFormData({ origen: '', destino: '', fecha_programada: '' });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error al programar viaje:', error);
      toast.error('Error al programar viaje: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Programar Nuevo Viaje
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="origen">Origen *</Label>
            <Input
              id="origen"
              value={formData.origen}
              onChange={(e) => setFormData(prev => ({ ...prev, origen: e.target.value }))}
              placeholder="Ciudad o dirección de origen"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destino">Destino *</Label>
            <Input
              id="destino"
              value={formData.destino}
              onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
              placeholder="Ciudad o dirección de destino"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_programada">Fecha Programada</Label>
            <Input
              id="fecha_programada"
              type="datetime-local"
              value={formData.fecha_programada}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha_programada: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Programando...' : 'Programar Viaje'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
