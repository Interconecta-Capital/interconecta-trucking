
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, User, Truck } from 'lucide-react';
import { useState } from 'react';

interface ProgramarViajeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProgramarViajeModal({ open, onOpenChange }: ProgramarViajeModalProps) {
  const [formData, setFormData] = useState({
    cartaPorte: '',
    origen: '',
    destino: '',
    fechaProgramada: '',
    horaProgramada: '',
    conductor: '',
    vehiculo: '',
    observaciones: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Programando viaje:', formData);
    // Aquí se implementaría la lógica para guardar el viaje programado
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programar Nuevo Viaje
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cartaPorte">Carta Porte *</Label>
              <Select value={formData.cartaPorte} onValueChange={(value) => handleInputChange('cartaPorte', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar carta porte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CP-001">CP-001</SelectItem>
                  <SelectItem value="CP-002">CP-002</SelectItem>
                  <SelectItem value="CP-003">CP-003</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaProgramada">Fecha Programada *</Label>
              <Input
                id="fechaProgramada"
                type="date"
                value={formData.fechaProgramada}
                onChange={(e) => handleInputChange('fechaProgramada', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origen" className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-green-600" />
                Origen *
              </Label>
              <Input
                id="origen"
                value={formData.origen}
                onChange={(e) => handleInputChange('origen', e.target.value)}
                placeholder="Ciudad de origen"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino" className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-red-600" />
                Destino *
              </Label>
              <Input
                id="destino"
                value={formData.destino}
                onChange={(e) => handleInputChange('destino', e.target.value)}
                placeholder="Ciudad de destino"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="horaProgramada">Hora Programada *</Label>
            <Input
              id="horaProgramada"
              type="time"
              value={formData.horaProgramada}
              onChange={(e) => handleInputChange('horaProgramada', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conductor" className="flex items-center gap-1">
                <User className="h-4 w-4 text-purple-600" />
                Conductor
              </Label>
              <Select value={formData.conductor} onValueChange={(value) => handleInputChange('conductor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar conductor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="juan-perez">Juan Pérez</SelectItem>
                  <SelectItem value="maria-garcia">María García</SelectItem>
                  <SelectItem value="carlos-lopez">Carlos López</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehiculo" className="flex items-center gap-1">
                <Truck className="h-4 w-4 text-green-600" />
                Vehículo
              </Label>
              <Select value={formData.vehiculo} onValueChange={(value) => handleInputChange('vehiculo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vehículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ABC-123">ABC-123</SelectItem>
                  <SelectItem value="XYZ-789">XYZ-789</SelectItem>
                  <SelectItem value="DEF-456">DEF-456</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Observaciones adicionales sobre el viaje..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Programar Viaje
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
