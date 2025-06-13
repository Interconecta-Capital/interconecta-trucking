
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { ImprovedAuthCard } from './ImprovedAuthCard';
import { ImprovedSocialButton } from './ImprovedSocialButton';
import { ImprovedFormField } from './ImprovedFormField';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Mail, Lock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EnhancedLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  
  const { signIn, signInWithGoogle, resendConfirmation, validateEmail } = useSimpleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const emailValidation = validateEmail(email);
      
      if (!emailValidation.isValid) {
        toast.error(emailValidation.message);
        return;
      }

      if (!password || password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      const success = await signIn(email, password);
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

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error('Error al autenticar con Google');
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
    <ImprovedAuthCard
      title="Interconecta Trucking"
      description="Sistema de Gestión de Cartas Porte"
    >
      <div className="space-y-6">
        <ImprovedSocialButton
          provider="google"
          actionText="Continuar con Google"
          onClick={handleGoogleAuth}
        />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-500 font-inter font-medium">
              O continúa con email
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <ImprovedFormField
            id="email"
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="tu@empresa.com"
            required
            icon={<Mail className="h-4 w-4 text-gray-500" />}
          />
          
          <ImprovedFormField
            id="password"
            label="Contraseña"
            value={password}
            onChange={setPassword}
            required
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            icon={<Lock className="h-4 w-4 text-gray-500" />}
          />
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary font-sora font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>
        
        {showResendOption && (
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 mb-3 font-inter">
              ¿Problemas para acceder? Es posible que necesites verificar tu correo.
            </p>
            <Button
              onClick={handleResendConfirmation}
              variant="outline"
              size="sm"
              className="w-full text-orange-700 border-orange-300 hover:bg-orange-100 font-inter"
            >
              Reenviar correo de verificación
            </Button>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="text-center space-y-3">
            <Link 
              to="/auth/forgot-password"
              className="text-sm text-interconecta-primary hover:text-interconecta-accent font-inter font-medium underline decoration-2 underline-offset-2 hover:decoration-interconecta-accent transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </ImprovedAuthCard>
  );
}
