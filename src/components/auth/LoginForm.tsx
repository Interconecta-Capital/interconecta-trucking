
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useUnconfirmedUserDetection } from '@/hooks/useUnconfirmedUserDetection';
import { UnconfirmedUserDialog } from '@/components/auth/UnconfirmedUserDialog';
import { toast } from 'sonner';
import { Truck, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  
  const {
    unconfirmedEmail,
    showUnconfirmedDialog,
    checkIfUserIsUnconfirmed,
    closeUnconfirmedDialog,
    handleVerificationSent,
  } = useUnconfirmedUserDetection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Bienvenido a Interconecta Trucking');
    } catch (error: any) {
      // Check if this is an unconfirmed user
      const isUnconfirmed = await checkIfUserIsUnconfirmed(email, error);
      
      if (!isUnconfirmed) {
        toast.error(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-interconecta-bg-alternate to-white p-4">
        <Card className="w-full max-w-md border-interconecta-border-subtle">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="interconecta-gradient p-3 rounded-xl">
                <Truck className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold font-sora text-interconecta-text-primary">
              Interconecta Trucking
            </CardTitle>
            <CardDescription className="font-inter text-interconecta-text-secondary">
              Sistema de Gestión de Cartas Porte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-inter text-interconecta-text-body">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-interconecta-border-subtle focus:ring-interconecta-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-inter text-interconecta-text-body">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-interconecta-border-subtle focus:ring-interconecta-primary"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-interconecta-primary hover:bg-interconecta-accent font-sora font-medium" 
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
            
            {/* Help section for verification issues */}
            <div className="mt-6 pt-4 border-t border-interconecta-border-subtle">
              <div className="text-center space-y-2">
                <p className="text-xs text-interconecta-text-secondary font-inter">
                  ¿Problemas para acceder?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (email) {
                      checkIfUserIsUnconfirmed(email, { message: 'Email not confirmed' });
                    } else {
                      toast.error('Por favor ingresa tu correo electrónico primero');
                    }
                  }}
                  className="inline-flex items-center text-xs text-interconecta-primary hover:text-interconecta-accent font-inter underline"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  ¿No verificaste tu correo?
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Unconfirmed User Dialog */}
      {showUnconfirmedDialog && unconfirmedEmail && (
        <UnconfirmedUserDialog
          email={unconfirmedEmail}
          onClose={closeUnconfirmedDialog}
          onVerificationSent={handleVerificationSent}
        />
      )}
    </>
  );
}
