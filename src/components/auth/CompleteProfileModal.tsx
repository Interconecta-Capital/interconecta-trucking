
import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CompleteProfileModalProps {
  open: boolean;
}

export function CompleteProfileModal({ open }: CompleteProfileModalProps) {
  const { user, sanitizeInput } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    rfc: '',
    telefono: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.user_metadata?.nombre || '',
        empresa: user.user_metadata?.empresa || '',
        rfc: user.user_metadata?.rfc || '',
        telefono: user.user_metadata?.telefono || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que todos los campos requeridos estén presentes
      if (!formData.nombre || !formData.empresa || !formData.rfc || !formData.telefono) {
        toast.error('Todos los campos son obligatorios');
        return;
      }

      toast.success('Perfil completado exitosamente');
      
      // Recargar la página después de un breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Error al completar perfil');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.nombre && formData.empresa && formData.rfc && formData.telefono;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Completa tu perfil</DialogTitle>
          <DialogDescription>
            Para usar la plataforma, necesitamos que completes la siguiente información
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Tu nombre completo"
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa *</Label>
            <Input
              id="empresa"
              value={formData.empresa}
              onChange={(e) => handleInputChange('empresa', e.target.value)}
              placeholder="Nombre de tu empresa"
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfc">RFC *</Label>
            <Input
              id="rfc"
              value={formData.rfc}
              onChange={(e) => handleInputChange('rfc', e.target.value.toUpperCase())}
              placeholder="RFC de tu empresa"
              required
              maxLength={13}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              placeholder="Tu número de teléfono"
              required
              maxLength={20}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading || !isFormValid}
              className="w-full"
            >
              {loading ? 'Completando...' : 'Completar perfil'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
