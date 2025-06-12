
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSecureAuth } from '@/hooks/auth/useSecureAuth';
import { useUnconfirmedUserDetection } from '@/hooks/useUnconfirmedUserDetection';
import { UnconfirmedUserDialog } from '@/components/auth/UnconfirmedUserDialog';
import { toast } from 'sonner';
import { Truck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { secureLogin, isLoading } = useSecureAuth();
  
  const {
    unconfirmedEmail,
    showUnconfirmedDialog,
    checkIfUserIsUnconfirmed,
    closeUnconfirmedDialog,
    handleVerificationSent,
  } = useUnconfirmedUserDetection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await secureLogin(email, password);
    if (!success) {
      // Check if this is an unconfirmed user
      await checkIfUserIsUnconfirmed(email, { message: 'Invalid login credentials' });
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-interconecta-border-subtle focus:ring-interconecta-primary pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-interconecta-text-secondary" />
                    ) : (
                      <Eye className="h-4 w-4 text-interconecta-text-secondary" />
                    )}
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-interconecta-primary hover:bg-interconecta-accent font-sora font-medium" 
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
            
            {/* Additional auth options */}
            <div className="mt-6 pt-4 border-t border-interconecta-border-subtle">
              <div className="text-center space-y-3">
                <Link 
                  to="/auth/forgot-password"
                  className="inline-flex items-center text-sm text-interconecta-primary hover:text-interconecta-accent font-inter underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
                
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
