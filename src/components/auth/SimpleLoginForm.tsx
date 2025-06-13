
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { toast } from 'sonner';
import { Truck, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SimpleLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  
  const { signIn, resendConfirmation, validateEmail, sanitizeInput } = useSimpleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const sanitizedEmail = sanitizeInput(email);
      const emailValidation = validateEmail(sanitizedEmail);
      
      if (!emailValidation.isValid) {
        toast.error(emailValidation.message);
        return;
      }

      if (!password || password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      const success = await signIn(sanitizedEmail, password);
      if (!success) {
        setShowResendOption(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error inesperado. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico primero');
      return;
    }
    
    await resendConfirmation(email);
    setShowResendOption(false);
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
          
          {showResendOption && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 mb-2">
                ¿Problemas para acceder? Es posible que necesites verificar tu correo.
              </p>
              <Button
                onClick={handleResendConfirmation}
                variant="outline"
                size="sm"
                className="w-full text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                Reenviar correo de verificación
              </Button>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-interconecta-border-subtle">
            <div className="text-center">
              <Link 
                to="/auth/forgot-password"
                className="text-sm text-interconecta-primary hover:text-interconecta-accent font-inter underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
