
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast.success('Perfil completado exitosamente');
    } catch (error: any) {
      toast.error('Error al completar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.nombre && formData.empresa && formData.rfc && formData.telefono;

  return (
    <Dialog open={open}>
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
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa *</Label>
            <Input
              id="empresa"
              value={formData.empresa}
              onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
              placeholder="Nombre de tu empresa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfc">RFC *</Label>
            <Input
              id="rfc"
              value={formData.rfc}
              onChange={(e) => setFormData(prev => ({ ...prev, rfc: e.target.value.toUpperCase() }))}
              placeholder="RFC de tu empresa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              placeholder="Tu número de teléfono"
              required
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
