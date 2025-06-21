
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SecureInput } from '@/components/security/SecureInput';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useCSRF } from '@/components/security/CSRFProtection';
import { toast } from 'sonner';
import { Truck, Eye, EyeOff, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SecureLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { secureLogin, isLoading } = useSecureAuth();
  const { csrfToken, validateToken } = useCSRF();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // CSRF protection
    if (!validateToken(csrfToken)) {
      toast.error('Token de seguridad inválido. Recarga la página.');
      return;
    }

    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    await secureLogin(email, password);
  };

  return (
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
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-green-600">
            <Shield className="h-3 w-3" />
            <span>Conexión Segura</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" value={csrfToken} />
            
            <div className="space-y-2">
              <Label htmlFor="email" className="font-inter text-interconecta-text-body">
                Correo Electrónico
              </Label>
              <SecureInput
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                validationType="email"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="font-inter text-interconecta-text-body">
                Contraseña
              </Label>
              <div className="relative">
                <SecureInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  showValidation={false}
                  className="pr-10"
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
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión Segura'}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-interconecta-border-subtle">
            <div className="text-center space-y-3">
              <Link 
                to="/auth/forgot-password"
                className="inline-flex items-center text-sm text-interconecta-primary hover:text-interconecta-accent font-inter underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
              
              <div className="text-xs text-interconecta-text-secondary">
                <p>¿No tienes una cuenta?</p>
                <Link 
                  to="/auth/register"
                  className="text-interconecta-primary hover:text-interconecta-accent underline"
                >
                  Crear cuenta nueva
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
