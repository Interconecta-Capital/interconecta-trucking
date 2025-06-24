
/**
 * @deprecated Este componente ha sido reemplazado por el flujo completo de ViajeWizard.tsx. No utilizar.
 * Use ViajeWizardModal and ViajeWizard components instead for the complete trip planning experience.
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, User, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from './components/FormField';

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
      const fechaFin = new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000);

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
            <FormField
              id="cartaPorte"
              label="Carta Porte"
              value={formData.cartaPorte}
              onChange={(value) => handleInputChange('cartaPorte', value)}
              placeholder="CP-001"
              required
              error={errors.cartaPorte}
            />

            <FormField
              id="fechaProgramada"
              label="Fecha Programada"
              type="date"
              value={formData.fechaProgramada}
              onChange={(value) => handleInputChange('fechaProgramada', value)}
              required
              error={errors.fechaProgramada}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="origen"
              label="Origen"
              value={formData.origen}
              onChange={(value) => handleInputChange('origen', value)}
              placeholder="Ciudad de origen"
              required
              error={errors.origen}
              icon={MapPin}
            />

            <FormField
              id="destino"
              label="Destino"
              value={formData.destino}
              onChange={(value) => handleInputChange('destino', value)}
              placeholder="Ciudad de destino"
              required
              error={errors.destino}
              icon={MapPin}
            />
          </div>

          <FormField
            id="horaProgramada"
            label="Hora Programada"
            type="time"
            value={formData.horaProgramada}
            onChange={(value) => handleInputChange('horaProgramada', value)}
            required
            error={errors.horaProgramada}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="conductor"
              label="Conductor (Opcional)"
              value={formData.conductor}
              onChange={(value) => handleInputChange('conductor', value)}
              placeholder="ID del conductor"
              icon={User}
            />

            <FormField
              id="vehiculo"
              label="Vehículo (Opcional)"
              value={formData.vehiculo}
              onChange={(value) => handleInputChange('vehiculo', value)}
              placeholder="ID del vehículo"
              icon={Truck}
            />
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
