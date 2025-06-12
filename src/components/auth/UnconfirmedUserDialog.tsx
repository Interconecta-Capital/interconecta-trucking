
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Mail, RefreshCw, AlertCircle } from 'lucide-react';

interface UnconfirmedUserDialogProps {
  email: string;
  onClose: () => void;
  onVerificationSent: () => void;
}

export function UnconfirmedUserDialog({ email, onClose, onVerificationSent }: UnconfirmedUserDialogProps) {
  const [resending, setResending] = useState(false);
  const { resendConfirmation } = useAuth();

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await resendConfirmation(email);
      toast.success('Correo de verificación reenviado exitosamente');
      onVerificationSent();
    } catch (error: any) {
      toast.error(error.message || 'Error al reenviar el correo');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-interconecta-border-subtle">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-sora text-interconecta-text-primary">
            Cuenta no verificada
          </CardTitle>
          <CardDescription className="font-inter">
            Tu cuenta existe pero necesita ser verificada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800 font-inter">
                Encontramos tu cuenta registrada con <strong>{email}</strong>, 
                pero aún no has verificado tu correo electrónico.
              </p>
            </div>
            
            <p className="text-sm text-interconecta-text-secondary font-inter">
              Para acceder a tu cuenta, necesitas hacer clic en el enlace de verificación 
              que te enviamos por correo. Si no lo encuentras, podemos reenviártelo.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full bg-interconecta-primary hover:bg-interconecta-accent font-inter"
              >
                {resending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Reenviar correo de verificación
                  </>
                )}
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full font-inter"
              >
                Usar otra cuenta
              </Button>
            </div>
            
            <div className="text-xs text-interconecta-text-secondary font-inter">
              <p className="mb-2">¿No recibes el correo?</p>
              <ul className="text-left space-y-1">
                <li>• Revisa tu carpeta de spam</li>
                <li>• Verifica que el email esté escrito correctamente</li>
                <li>• Intenta con otro proveedor de email</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
