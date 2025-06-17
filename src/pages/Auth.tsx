import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { EmailVerificationMessage } from '@/components/auth/EmailVerificationMessage';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { UnconfirmedUserDialog } from '@/components/auth/UnconfirmedUserDialog';
import { useUnconfirmedUserDetection } from '@/hooks/useUnconfirmedUserDetection';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'main' | 'magic-link' | 'forgot-password'>('main');
  
  if (currentView === 'magic-link') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-05 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-gray-60 hover:text-blue-interconecta transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
            
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
                alt="Interconecta Trucking Logo"
                className="h-16 w-16 rounded-xl"
              />
            </div>
            <h1 className="text-subtitle font-bold text-pure-black">
              Interconecta Trucking
            </h1>
            <p className="text-gray-60">
              Sistema de Gestión de Cartas Porte
            </p>
          </div>
          
          <MagicLinkForm onBack={() => setCurrentView('main')} />
        </div>
      </div>
    );
  }

  if (currentView === 'forgot-password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-05 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-gray-60 hover:text-blue-interconecta transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
            
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
                alt="Interconecta Trucking Logo"
                className="h-16 w-16 rounded-xl"
              />
            </div>
            <h1 className="text-subtitle font-bold text-pure-black">
              Interconecta Trucking
            </h1>
            <p className="text-gray-60">
              Sistema de Gestión de Cartas Porte
            </p>
          </div>
          
          <ForgotPasswordForm onBack={() => setCurrentView('main')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-05 p-4">
      <div className="w-full max-w-md">
        {/* Header con enlace de regreso */}
        <div className="text-center mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-60 hover:text-blue-interconecta transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
              alt="Interconecta Trucking Logo"
              className="h-16 w-16 rounded-xl"
            />
          </div>
          <h1 className="text-subtitle font-bold text-pure-black">
            Interconecta Trucking
          </h1>
          <p className="text-gray-60">
            Sistema de Gestión de Cartas Porte
          </p>
        </div>

        <Card className="card-premium border-gray-20 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-subtitle font-bold text-pure-black">Accede a tu cuenta</CardTitle>
            <CardDescription className="text-gray-60">
              Ingresa tus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
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
          <p className="text-sm text-gray-60 mb-2">
            ¿Nuevo en Interconecta Trucking?
          </p>
          <Link to="/auth/trial">
            <Button variant="outline" className="w-full border-blue-interconecta text-blue-interconecta hover:bg-blue-light">
              Comenzar prueba gratuita de 14 días
            </Button>
          </Link>
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
      // Check if this is an unconfirmed user
      const isUnconfirmed = checkIfUserIsUnconfirmed(email, error);
      
      if (!isUnconfirmed) {
        // Show original error if not unconfirmed user issue
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
            <span className="w-full border-t border-gray-20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-60 font-inter">
              O accede con
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={onShowMagicLink}
            variant="outline"
            className="w-full border-gray-20 text-gray-60 hover:bg-gray-20 font-inter"
          >
            Link Mágico (Sin contraseña)
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="font-inter">
              Correo Electrónico
            </Label>
            <Input
              id="login-email"
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="font-inter">
              Contraseña
            </Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-gray-20"
            />
          </div>
          
          <div className="text-right">
            <button
              type="button"
              onClick={onShowForgotPassword}
              className="text-sm text-gray-60 hover:text-blue-interconecta font-inter underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-interconecta hover:bg-blue-light font-sora" 
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
        
        {/* Help text for unconfirmed users */}
        <div className="text-center">
          <p className="text-xs text-gray-60 font-inter">
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
              className="text-gray-60 hover:text-blue-interconecta underline"
            >
              Reenviar verificación
            </button>
          </p>
        </div>
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
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
          <span className="w-full border-t border-gray-20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-60 font-inter">
            O regístrate con email
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="font-inter">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
              className="border-gray-20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono" className="font-inter">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              className="border-gray-20"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="empresa" className="font-inter">Empresa</Label>
          <Input
            id="empresa"
            value={formData.empresa}
            onChange={(e) => handleChange('empresa', e.target.value)}
            required
            className="border-gray-20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rfc" className="font-inter">RFC de la Empresa</Label>
          <Input
            id="rfc"
            value={formData.rfc}
            onChange={(e) => handleChange('rfc', e.target.value.toUpperCase())}
            required
            maxLength={13}
            className="border-gray-20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-email" className="font-inter">Correo Electrónico</Label>
          <Input
            id="register-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="border-gray-20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-password" className="font-inter">Contraseña</Label>
          <Input
            id="register-password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
            minLength={6}
            className="border-gray-20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="font-inter">Confirmar Contraseña</Label>
          <Input
            id="confirm-password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            required
            className="border-gray-20"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-blue-interconecta hover:bg-blue-light font-sora" 
          disabled={loading}
        >
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>
      </form>
    </div>
  );
}
