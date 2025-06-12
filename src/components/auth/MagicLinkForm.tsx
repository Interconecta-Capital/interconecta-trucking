
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';

interface MagicLinkFormProps {
  onBack: () => void;
}

export function MagicLinkForm({ onBack }: MagicLinkFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { signInWithMagicLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithMagicLink(email);
      setSent(true);
      toast.success('¡Link mágico enviado! Revisa tu correo.');
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el link mágico');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="border-interconecta-border-subtle">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-interconecta-primary-light rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-interconecta-primary" />
            </div>
          </div>
          <CardTitle className="text-xl font-sora">Link Mágico Enviado</CardTitle>
          <CardDescription className="font-inter">
            Te hemos enviado un link mágico a:
          </CardDescription>
          <p className="font-medium text-interconecta-text-primary font-inter">
            {email}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-interconecta-text-secondary font-inter">
              Haz clic en el enlace del correo para acceder a tu cuenta. 
              El enlace es válido por 1 hora.
            </p>
            
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light font-inter"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-interconecta-border-subtle">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-sora">Acceso con Link Mágico</CardTitle>
        <CardDescription className="font-inter">
          Te enviaremos un enlace seguro para acceder sin contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magic-email" className="font-inter">
              Correo Electrónico
            </Label>
            <Input
              id="magic-email"
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-interconecta-border-subtle"
            />
          </div>
          
          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full bg-interconecta-primary hover:bg-interconecta-accent font-sora" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Mail className="h-4 w-4 mr-2 animate-pulse" />
                  Enviando link...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Link Mágico
                </>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={onBack}
              variant="ghost"
              className="w-full font-inter"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
