
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useInputSanitization } from '@/hooks/useInputSanitization';
import { useCSRFProtection } from '@/hooks/useCSRFProtection';
import { useUnconfirmedUserDetection } from '@/hooks/useUnconfirmedUserDetection';
import { UnconfirmedUserDialog } from '@/components/auth/UnconfirmedUserDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Truck, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EnhancedLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { enhancedLogin, isAccountLocked, lockoutEndTime, getRecentAttempts } = useEnhancedAuth();
  const { sanitizeInput, validateEmail } = useInputSanitization();
  const { csrfToken } = useCSRFProtection();
  
  const {
    unconfirmedEmail,
    showUnconfirmedDialog,
    checkIfUserIsUnconfirmed,
    closeUnconfirmedDialog,
    handleVerificationSent,
  } = useUnconfirmedUserDetection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Sanitize and validate inputs
      const sanitizedEmail = sanitizeInput(email, 'email', { maxLength: 254 });
      const emailValidation = validateEmail(sanitizedEmail);
      
      if (!emailValidation.isValid) {
        toast.error(emailValidation.error);
        return;
      }

      if (!password || password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      // Check account lockout
      if (isAccountLocked && lockoutEndTime) {
        const remainingMinutes = Math.ceil((lockoutEndTime - Date.now()) / (60 * 1000));
        toast.error(`Cuenta bloqueada. Intente nuevamente en ${remainingMinutes} minutos.`);
        return;
      }

      const success = await enhancedLogin(sanitizedEmail, password);
      if (!success) {
        // Check if this is an unconfirmed user
        checkIfUserIsUnconfirmed(sanitizedEmail, { message: 'Invalid login credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error inesperado. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFailedAttemptCount = () => {
    if (!email) return 0;
    const attempts = getRecentAttempts(email.toLowerCase());
    return attempts.filter(attempt => !attempt.success).length;
  };

  const getRemainingLockoutTime = () => {
    if (!lockoutEndTime) return null;
    const remaining = Math.ceil((lockoutEndTime - Date.now()) / (60 * 1000));
    return remaining > 0 ? remaining : null;
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
            <div className="flex items-center justify-center mt-2 text-xs text-green-600">
              <Shield className="h-3 w-3 mr-1" />
              <span>Autenticación Segura</span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Security Warnings */}
            {isAccountLocked && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cuenta bloqueada por seguridad. Tiempo restante: {getRemainingLockoutTime()} minutos.
                </AlertDescription>
              </Alert>
            )}
            
            {!isAccountLocked && getFailedAttemptCount() > 2 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {getFailedAttemptCount()} intentos fallidos. La cuenta se bloqueará después de 5 intentos.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="csrf_token" value={csrfToken} />
              
              <div className="space-y-2">
                <Label htmlFor="email" className="font-inter text-interconecta-text-body">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(sanitizeInput(e.target.value, 'email', { maxLength: 254 }))}
                  required
                  maxLength={254}
                  className="border-interconecta-border-subtle focus:ring-interconecta-primary"
                  disabled={isAccountLocked}
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
                    minLength={6}
                    maxLength={128}
                    className="border-interconecta-border-subtle focus:ring-interconecta-primary pr-10"
                    disabled={isAccountLocked}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isAccountLocked}
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
                disabled={isLoading || isAccountLocked}
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
                    disabled={isAccountLocked}
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
