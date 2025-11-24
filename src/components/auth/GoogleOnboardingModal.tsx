import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function GoogleOnboardingModal() {
  const { user, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    acceptedTerms: false,
  });

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      // Verificar si el usuario se registró con Google y no ha completado onboarding
      const isGoogleUser = user.email?.includes('@') && user.app_metadata?.provider === 'google';
      const needsOnboarding = !user.profile?.google_onboarding_completed;
      
      if (isGoogleUser && needsOnboarding) {
        // Pre-llenar datos disponibles
        setFormData({
          nombre: user.profile?.nombre || user.user_metadata?.full_name || '',
          telefono: user.profile?.telefono || '',
          acceptedTerms: false,
        });
        setOpen(true);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptedTerms) {
      toast.error('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    if (!formData.nombre || !formData.telefono) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      // Actualizar perfil con datos completos
      await updateProfile({
        nombre: formData.nombre,
        telefono: formData.telefono,
        google_onboarding_completed: true,
      });

      // Guardar consentimientos con IP y User Agent
      const { getUserIP, getUserAgent } = await import('@/utils/getUserIP');
      const ipAddress = await getUserIP();
      const userAgent = getUserAgent();
      
      await supabase.from('user_consents').insert([
        {
          user_id: user!.id,
          consent_type: 'privacy_policy',
          granted: true,
          granted_at: new Date().toISOString(),
          version: '1.0',
          ip_address: ipAddress,
          user_agent: userAgent
        },
        {
          user_id: user!.id,
          consent_type: 'terms_of_service',
          granted: true,
          granted_at: new Date().toISOString(),
          version: '1.0',
          ip_address: ipAddress,
          user_agent: userAgent
        }
      ]);
      
      toast.success('¡Bienvenido a Interconecta Trucking!');
      setOpen(false);
      
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error('Error al completar el registro: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!user) return;
    
    try {
      // Desactivar cuenta temporalmente
      await updateProfile({
        google_onboarding_completed: false,
      });
      
      // Cerrar sesión
      await supabase.auth.signOut();
      
      toast.info('Cuenta desactivada. Podrás reactivarla cuando aceptes los términos.');
      setOpen(false);
    } catch (error) {
      console.error('Error declining onboarding:', error);
      toast.error('Error al procesar la solicitud');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Completa tu registro</DialogTitle>
          <DialogDescription>
            Para continuar, necesitamos confirmar algunos datos
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
              maxLength={255}
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
              maxLength={20}
              pattern="[0-9\-\+\(\)\s]*"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms-google" 
              checked={formData.acceptedTerms}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptedTerms: checked as boolean }))}
              required
              className="mt-1"
            />
            <label htmlFor="terms-google" className="text-sm leading-tight cursor-pointer">
              Acepto la{' '}
              <Link to="/privacy" target="_blank" className="text-blue-600 hover:underline font-medium">
                Política de Privacidad
              </Link>
              {' '}y los{' '}
              <Link to="/terms" target="_blank" className="text-blue-600 hover:underline font-medium">
                Términos de Servicio
              </Link>
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={handleDecline}
              disabled={loading}
            >
              No aceptar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.acceptedTerms}
              className="w-full sm:w-auto"
            >
              {loading ? 'Completando...' : 'Aceptar y Continuar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}