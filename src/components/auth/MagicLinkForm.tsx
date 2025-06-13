
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';

interface MagicLinkFormProps {
  onBack: () => void;
}

export function MagicLinkForm({ onBack }: MagicLinkFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { signInWithGoogle } = useSimpleAuth(); // Using available method from useSimpleAuth

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, we'll use Google auth as magic link alternative
      await signInWithGoogle();
      setSent(true);
      toast.success('¡Autenticación iniciada! Completa el proceso con Google.');
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar autenticación');
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
          <CardTitle className="text-xl font-sora">Autenticación Iniciada</CardTitle>
          <CardDescription className="font-inter">
            Complete el proceso con Google
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-interconecta-text-secondary font-inter">
              Complete la autenticación en la ventana que se abrió.
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
        <CardTitle className="text-xl font-sora">Acceso Rápido</CardTitle>
        <CardDescription className="font-inter">
          Acceso rápido con Google
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
                  Iniciando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Acceso con Google
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
