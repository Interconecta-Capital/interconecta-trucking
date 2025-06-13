
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, User, Truck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProgramarViajeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  cartaPorte: string;
  origen: string;
  destino: string;
  fechaProgramada: string;
  horaProgramada: string;
  conductor: string;
  vehiculo: string;
  observaciones: string;
}

export function ProgramarViajeModal({ open, onOpenChange }: ProgramarViajeModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  
  const [formData, setFormData] = useState<FormData>({
    cartaPorte: '',
    origen: '',
    destino: '',
    fechaProgramada: '',
    horaProgramada: '',
    conductor: '',
    vehiculo: '',
    observaciones: ''
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.cartaPorte) newErrors.cartaPorte = 'Campo requerido';
    if (!formData.origen) newErrors.origen = 'Campo requerido';
    if (!formData.destino) newErrors.destino = 'Campo requerido';
    if (!formData.fechaProgramada) newErrors.fechaProgramada = 'Campo requerido';
    if (!formData.horaProgramada) newErrors.horaProgramada = 'Campo requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.id) {
      console.error('Validation failed or user not authenticated');
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting viaje:', formData);

    try {
      // Combinar fecha y hora
      const fechaInicio = new Date(`${formData.fechaProgramada}T${formData.horaProgramada}`);
      const fechaFin = new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000); // +24 horas por defecto

      const viajeData = {
        carta_porte_id: formData.cartaPorte,
        origen: formData.origen,
        destino: formData.destino,
        fecha_inicio_programada: fechaInicio.toISOString(),
        fecha_fin_programada: fechaFin.toISOString(),
        conductor_id: formData.conductor || null,
        vehiculo_id: formData.vehiculo || null,
        observaciones: formData.observaciones || null,
        estado: 'programado',
        user_id: user.id
      };

      console.log('Inserting viaje data:', viajeData);

      const { data, error } = await supabase
        .from('viajes')
        .insert(viajeData)
        .select()
        .single();

      if (error) {
        console.error('Error creating viaje:', error);
        throw error;
      }

      console.log('Viaje created successfully:', data);
      toast.success('Viaje programado exitosamente');
      
      // Reset form
      setFormData({
        cartaPorte: '',
        origen: '',
        destino: '',
        fechaProgramada: '',
        horaProgramada: '',
        conductor: '',
        vehiculo: '',
        observaciones: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Error al programar el viaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programar Nuevo Viaje
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cartaPorte">
                Carta Porte *
              </Label>
              <Input
                id="cartaPorte"
                value={formData.cartaPorte}
                onChange={(e) => handleInputChange('cartaPorte', e.target.value)}
                placeholder="CP-001"
                required
                className={errors.cartaPorte ? 'border-red-500' : ''}
              />
              {errors.cartaPorte && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cartaPorte}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaProgramada">Fecha Programada *</Label>
              <Input
                id="fechaProgramada"
                type="date"
                value={formData.fechaProgramada}
                onChange={(e) => handleInputChange('fechaProgramada', e.target.value)}
                required
                className={errors.fechaProgramada ? 'border-red-500' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.fechaProgramada && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.fechaProgramada}
                </div>
              )}
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
                className={errors.origen ? 'border-red-500' : ''}
              />
              {errors.origen && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.origen}
                </div>
              )}
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
                className={errors.destino ? 'border-red-500' : ''}
              />
              {errors.destino && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.destino}
                </div>
              )}
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
              className={errors.horaProgramada ? 'border-red-500' : ''}
            />
            {errors.horaProgramada && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.horaProgramada}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conductor" className="flex items-center gap-1">
                <User className="h-4 w-4 text-purple-600" />
                Conductor (Opcional)
              </Label>
              <Input
                id="conductor"
                value={formData.conductor}
                onChange={(e) => handleInputChange('conductor', e.target.value)}
                placeholder="ID del conductor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehiculo" className="flex items-center gap-1">
                <Truck className="h-4 w-4 text-green-600" />
                Vehículo (Opcional)
              </Label>
              <Input
                id="vehiculo"
                value={formData.vehiculo}
                onChange={(e) => handleInputChange('vehiculo', e.target.value)}
                placeholder="ID del vehículo"
              />
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Programando...' : 'Programar Viaje'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
