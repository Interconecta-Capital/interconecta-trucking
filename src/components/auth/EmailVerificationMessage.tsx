
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { toast } from 'sonner';
import { Mail, RefreshCw } from 'lucide-react';

interface EmailVerificationMessageProps {
  email: string;
  onBack: () => void;
}

export function EmailVerificationMessage({ email, onBack }: EmailVerificationMessageProps) {
  const [resending, setResending] = useState(false);
  const { resendConfirmation } = useSimpleAuth();

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await resendConfirmation(email);
      toast.success('Correo de verificación reenviado');
    } catch (error: any) {
      toast.error(error.message || 'Error al reenviar el correo');
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="border-interconecta-border-subtle">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-interconecta-primary-light rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-interconecta-primary" />
          </div>
        </div>
        <CardTitle className="text-xl font-sora">Verifica tu correo electrónico</CardTitle>
        <CardDescription className="font-inter">
          Te hemos enviado un enlace de verificación a:
        </CardDescription>
        <p className="font-medium text-interconecta-text-primary font-inter">
          {email}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <p className="text-sm text-interconecta-text-secondary font-inter">
            Haz clic en el enlace del correo para activar tu cuenta. 
            Si no lo encuentras, revisa tu carpeta de spam.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleResendEmail}
              disabled={resending}
              variant="outline"
              className="w-full border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light font-inter"
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
              onClick={onBack}
              variant="ghost"
              className="w-full font-inter"
            >
              Volver al registro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
