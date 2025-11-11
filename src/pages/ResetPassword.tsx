
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSecurePasswordReset } from '@/hooks/auth/useSecurePasswordReset';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const { updatePassword, validatePasswordStrength, isLoading } = useSecurePasswordReset();

  useEffect(() => {
    // Verify token presence and exchange it securely
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      toast.error('Enlace de recuperación inválido o expirado');
      navigate('/auth/login');
      return;
    }

    // Clear tokens from URL immediately for security
    const url = new URL(window.location.href);
    url.searchParams.delete('access_token');
    url.searchParams.delete('refresh_token');
    url.searchParams.delete('type');
    window.history.replaceState({}, document.title, url.pathname);

    // Validate and set session with tokens
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) {
          console.error('Token validation error:', error);
          toast.error('Enlace de recuperación inválido o expirado');
          navigate('/auth/login');
        } else {
          setValidToken(true);
        }
      });
    });
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message);
      return;
    }

    const success = await updatePassword(password);
    if (success) {
      // Clear form and redirect after successful update
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-interconecta-bg-alternate to-white p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-interconecta-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-interconecta-bg-alternate to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
              alt="Interconecta Trucking Logo"
              className="h-12 w-12 md:h-16 md:w-16 rounded-xl"
            />
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-sora text-interconecta-text-primary">
            Interconecta Trucking
          </h1>
          <p className="font-inter text-interconecta-text-secondary text-sm md:text-base">
            Restablecer Contraseña
          </p>
        </div>

        <Card className="border-interconecta-border-subtle">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-interconecta-primary-light rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 md:h-6 md:w-6 text-interconecta-primary" />
              </div>
            </div>
            <CardTitle className="text-lg md:text-xl font-sora">Nueva Contraseña</CardTitle>
            <CardDescription className="font-inter text-sm">
              Ingresa tu nueva contraseña para completar la recuperación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="font-inter text-sm">
                  Nueva Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={12}
                    className="border-interconecta-border-subtle pr-10"
                    placeholder="Mínimo 12 caracteres con mayúsculas, minúsculas, números y símbolos"
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
                <PasswordStrengthMeter password={password} showRequirements />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="font-inter text-sm">
                  Confirmar Nueva Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-interconecta-border-subtle pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-interconecta-text-secondary" />
                    ) : (
                      <Eye className="h-4 w-4 text-interconecta-text-secondary" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-interconecta-primary hover:bg-interconecta-accent font-sora text-sm md:text-base" 
                disabled={isLoading}
              >
                {isLoading ? 'Actualizando contraseña...' : 'Actualizar Contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
