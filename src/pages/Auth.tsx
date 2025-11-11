
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MobileAuthInput } from '@/components/auth/MobileAuthInput';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { EmailVerificationMessage } from '@/components/auth/EmailVerificationMessage';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { UnconfirmedUserDialog } from '@/components/auth/UnconfirmedUserDialog';
import { useUnconfirmedUserDetection } from '@/hooks/useUnconfirmedUserDetection';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'main' | 'magic-link' | 'forgot-password'>('main');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
    }> = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        vx: Math.random() * 0.3 - 0.15,
        vy: Math.random() * 0.3 - 0.15
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(245, 245, 247, 0.3)';

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (currentView === 'magic-link') {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-0"
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <Link 
                to="/" 
                className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-bold apple-gradient-text mb-2">
                Interconecta
              </h1>
              <p className="text-gray-400">
                El Centro de Comando para tu Logística
              </p>
            </div>
            
            <MagicLinkForm onBack={() => setCurrentView('main')} />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'forgot-password') {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-0"
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <Link 
                to="/" 
                className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-bold apple-gradient-text mb-2">
                Interconecta
              </h1>
              <p className="text-gray-400">
                El Centro de Comando para tu Logística
              </p>
            </div>
            
            <ForgotPasswordForm onBack={() => setCurrentView('main')} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0"
      />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header con enlace de regreso */}
          <div className="text-center mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
            
            <h1 className="text-3xl md:text-4xl font-bold apple-gradient-text mb-2">
              Interconecta
            </h1>
            <p className="text-gray-400">
              El Centro de Comando para tu Logística
            </p>
          </div>

          <Card className="feature-card border border-gray-800">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-white">Accede a tu cuenta</CardTitle>
              <CardDescription className="text-gray-400">
                Ingresa tus credenciales para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
                  <TabsTrigger value="login" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                    Iniciar Sesión
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                    Registrarse
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <LoginForm onShowMagicLink={() => setCurrentView('magic-link')} onShowForgotPassword={() => setCurrentView('forgot-password')} />
                </TabsContent>
                
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Enlace a prueba gratuita */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400 mb-3">
              ¿Nuevo en Interconecta Trucking?
            </p>
            <Link to="/auth?tab=register">
              <Button className="btn-primary w-full rounded-full font-semibold">
                Comenzar prueba gratuita de 14 días
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoginFormProps {
  onShowMagicLink: () => void;
  onShowForgotPassword: () => void;
}

function LoginForm({ onShowMagicLink, onShowForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
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
      toast.success('¡Bienvenido de vuelta!');
      navigate('/dashboard');
    } catch (error: any) {
      const isUnconfirmed = checkIfUserIsUnconfirmed(email, error);
      
      if (!isUnconfirmed) {
        toast.error(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <SocialAuthButtons mode="login" />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2 text-gray-400">
              O accede con
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={onShowMagicLink}
            className="btn-secondary w-full rounded-full font-semibold"
          >
            Link Mágico (Sin contraseña)
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-gray-300 text-sm md:text-base">
              Correo Electrónico
            </Label>
            <MobileAuthInput
              id="login-email"
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-gray-300 text-sm md:text-base">
              Contraseña
            </Label>
            <div className="relative">
              <MobileAuthInput
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-right">
            <button
              type="button"
              onClick={onShowForgotPassword}
              className="text-sm text-gray-400 hover:text-white underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          
          <Button 
            type="submit" 
            className="btn-primary w-full rounded-full font-semibold min-h-[48px]" 
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
        
        <div className="text-center">
          <p className="text-xs text-gray-400">
            ¿Te registraste pero no verificaste tu correo?{' '}
            <button
              type="button"
              onClick={() => {
                if (email) {
                  checkIfUserIsUnconfirmed(email, { message: 'Email not confirmed' });
                } else {
                  toast.error('Por favor ingresa tu correo electrónico primero');
                }
              }}
              className="text-gray-400 hover:text-white underline"
            >
              Reenviar verificación
            </button>
          </p>
        </div>
      </div>
      
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

function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    empresa: '',
    rfc: '',
    telefono: ''
  });
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      toast.error('Debes aceptar los términos y condiciones para continuar');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(formData.email, formData.password, {
        nombre: formData.nombre,
        empresa: formData.empresa,
        rfc: formData.rfc,
        telefono: formData.telefono
      });
      
      if (result.needsVerification) {
        setShowVerification(true);
        toast.success('¡Cuenta creada! Revisa tu correo para verificar tu cuenta.');
      } else {
        // Guardar consentimientos
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any).from('user_consents').insert([
            {
              user_id: user.id,
              consent_type: 'privacy_policy',
              granted: true,
              granted_at: new Date().toISOString(),
              version: '1.0'
            },
            {
              user_id: user.id,
              consent_type: 'terms_of_service',
              granted: true,
              granted_at: new Date().toISOString(),
              version: '1.0'
            }
          ]);
        }
        
        toast.success('¡Cuenta creada exitosamente! Bienvenido a Interconecta Trucking');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showVerification) {
    return (
      <EmailVerificationMessage 
        email={formData.email}
        onBack={() => setShowVerification(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SocialAuthButtons mode="register" />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-black px-2 text-gray-400">
            O regístrate con email
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-gray-300 text-sm md:text-base">Nombre</Label>
            <MobileAuthInput
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-gray-300 text-sm md:text-base">Teléfono</Label>
            <MobileAuthInput
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="empresa" className="text-gray-300 text-sm md:text-base">Empresa</Label>
          <MobileAuthInput
            id="empresa"
            value={formData.empresa}
            onChange={(e) => handleChange('empresa', e.target.value)}
            required
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rfc" className="text-gray-300 text-sm md:text-base">RFC de la Empresa</Label>
          <MobileAuthInput
            id="rfc"
            value={formData.rfc}
            onChange={(e) => handleChange('rfc', e.target.value.toUpperCase())}
            required
            maxLength={13}
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-gray-300 text-sm md:text-base">Correo Electrónico</Label>
          <MobileAuthInput
            id="register-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-gray-300 text-sm md:text-base">Contraseña</Label>
          <div className="relative">
            <MobileAuthInput
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              minLength={6}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-gray-300 text-sm md:text-base">Confirmar Contraseña</Label>
          <div className="relative">
            <MobileAuthInput
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              required
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            required
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-gray-300 leading-tight cursor-pointer">
            Acepto la{' '}
            <Link to="/privacy" target="_blank" className="text-blue-400 hover:underline">
              Política de Privacidad
            </Link>
            {' '}y los{' '}
            <Link to="/terms" target="_blank" className="text-blue-400 hover:underline">
              Términos de Servicio
            </Link>
          </label>
        </div>
        
        <Button 
          type="submit" 
          className="btn-primary w-full rounded-full font-semibold min-h-[48px]" 
          disabled={loading || !acceptedTerms}
        >
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>
      </form>
    </div>
  );
}
