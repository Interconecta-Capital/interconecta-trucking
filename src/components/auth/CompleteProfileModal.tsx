
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUnconfirmedUserDetection } from '@/hooks/useUnconfirmedUserDetection';
import { useSecurity } from '@/components/SecurityProvider';
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
  const { user, updateProfile } = useAuth();
  const { validateUniqueRFC } = useUnconfirmedUserDetection();
  const { validateFormData, sanitizeInput, checkRateLimit, logSecurityEvent } = useSecurity();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    rfc: '',
    telefono: '',
  });

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        nombre: user.profile.nombre || '',
        empresa: user.profile.empresa || '',
        rfc: user.profile.rfc || '',
        telefono: user.profile.telefono || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    // Sanitize input on change
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!checkRateLimit('profile_update', 3)) {
      return;
    }

    setLoading(true);

    try {
      // Log attempt
      await logSecurityEvent('PROFILE_UPDATE_ATTEMPT', {
        fields: Object.keys(formData)
      });

      // Validate form data
      const validation = validateFormData(formData);
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        await logSecurityEvent('PROFILE_UPDATE_VALIDATION_FAILED', {
          errors: validation.errors
        });
        setLoading(false);
        return;
      }

      // Validar RFC único
      const rfcValidation = await validateUniqueRFC(formData.rfc);
      if (!rfcValidation.isValid) {
        toast.error(rfcValidation.message || 'RFC inválido');
        await logSecurityEvent('PROFILE_UPDATE_RFC_DUPLICATE', {
          rfc: formData.rfc
        });
        setLoading(false);
        return;
      }

      await updateProfile({
        ...formData,
        rfc: formData.rfc.toUpperCase()
      });
      
      toast.success('Perfil completado exitosamente');
      
      await logSecurityEvent('PROFILE_UPDATE_SUCCESS');
      
      // Forzar recarga para refrescar el estado
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      const errorMessage = 'Error al completar perfil: ' + error.message;
      toast.error(errorMessage);
      
      await logSecurityEvent('PROFILE_UPDATE_ERROR', {
        error: error.message
      });
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
              pattern="[A-ZÑ&0-9]{12,13}"
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
              pattern="[0-9\-\+\(\)\s]*"
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
