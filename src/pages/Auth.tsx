
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Truck, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-interconecta-bg-alternate to-white p-4">
      <div className="w-full max-w-md">
        {/* Header con enlace de regreso */}
        <div className="text-center mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-interconecta-text-secondary hover:text-interconecta-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          
          <div className="flex justify-center mb-4">
            <div className="interconecta-gradient p-3 rounded-xl">
              <Truck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-sora text-interconecta-text-primary">
            Interconecta Trucking
          </h1>
          <p className="font-inter text-interconecta-text-secondary">
            Sistema de Gestión de Cartas Porte
          </p>
        </div>

        <Card className="border-interconecta-border-subtle">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-sora">Accede a tu cuenta</CardTitle>
            <CardDescription className="font-inter">
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
                <LoginForm />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Enlace a prueba gratuita */}
        <div className="text-center mt-6">
          <p className="text-sm text-interconecta-text-secondary font-inter mb-2">
            ¿Nuevo en Interconecta Trucking?
          </p>
          <Link to="/auth/trial">
            <Button variant="outline" className="w-full border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light">
              Comenzar prueba gratuita de 14 días
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('¡Bienvenido de vuelta!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          className="border-interconecta-border-subtle"
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
          className="border-interconecta-border-subtle"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-interconecta-primary hover:bg-interconecta-accent font-sora" 
        disabled={loading}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
    </form>
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
      await signUp(formData.email, formData.password, {
        nombre: formData.nombre,
        empresa: formData.empresa,
        rfc: formData.rfc,
        telefono: formData.telefono
      });
      toast.success('¡Cuenta creada exitosamente! Bienvenido a Interconecta Trucking');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre" className="font-inter">Nombre</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            required
            className="border-interconecta-border-subtle"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono" className="font-inter">Teléfono</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            className="border-interconecta-border-subtle"
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
          className="border-interconecta-border-subtle"
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
          className="border-interconecta-border-subtle"
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
          className="border-interconecta-border-subtle"
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
          className="border-interconecta-border-subtle"
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
          className="border-interconecta-border-subtle"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-interconecta-primary hover:bg-interconecta-accent font-sora" 
        disabled={loading}
      >
        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>
    </form>
  );
}
