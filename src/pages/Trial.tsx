import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft, Check, Calendar } from 'lucide-react';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';

export default function Trial() {
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
        telefono: formData.telefono,
        isTrial: true
      });
      toast.success('¡Tu prueba gratuita de 14 días ha comenzado!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar la prueba gratuita');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-interconecta-bg-alternate to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-interconecta-border-subtle">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
              alt="Interconecta Trucking Logo"
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-xl font-bold font-sora text-interconecta-text-primary">
              Interconecta Trucking
            </span>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-interconecta-primary-light border border-interconecta-border-subtle rounded-full px-4 py-2 mb-6">
              <Calendar className="h-4 w-4 text-interconecta-primary mr-2" />
              <span className="text-sm font-inter font-medium text-interconecta-text-body">
                Prueba Gratuita por 14 Días
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold font-sora text-interconecta-text-primary mb-6">
              Comienza tu prueba gratuita
            </h1>
            <p className="text-xl font-inter text-interconecta-text-secondary max-w-2xl mx-auto">
              Accede a todas las funciones de Interconecta Trucking sin costo por 14 días. 
              No se requiere tarjeta de crédito.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulario */}
            <Card className="border-interconecta-border-subtle">
              <CardHeader>
                <CardTitle className="text-2xl font-sora">Crear cuenta de prueba</CardTitle>
                <CardDescription className="font-inter">
                  Completa el formulario para comenzar tu prueba gratuita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <SocialAuthButtons mode="register" />
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="font-inter">Nombre Completo</Label>
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
                      <Label htmlFor="empresa" className="font-inter">Nombre de la Empresa</Label>
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
                      <Label htmlFor="email" className="font-inter">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        className="border-interconecta-border-subtle"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="font-inter">Contraseña</Label>
                      <Input
                        id="password"
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
                      className="w-full bg-interconecta-primary hover:bg-interconecta-accent font-sora text-lg py-3" 
                      disabled={loading}
                    >
                      {loading ? 'Creando cuenta...' : 'Comenzar Prueba Gratuita'}
                    </Button>
                    
                    <p className="text-xs text-interconecta-text-secondary text-center font-inter">
                      Al registrarte, aceptas nuestros términos de servicio y política de privacidad
                    </p>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Beneficios */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold font-sora text-interconecta-text-primary">
                ¿Qué incluye tu prueba gratuita?
              </h3>
              
              <div className="space-y-4">
                {[
                  'Cartas porte ilimitadas por 14 días',
                  'Gestión completa de flota y conductores',
                  'Dashboard con analytics en tiempo real',
                  'Soporte técnico completo',
                  'Todas las funciones premium',
                  'Sin límites de usuarios'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-inter text-interconecta-text-body">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-interconecta-primary-light p-6 rounded-lg border border-interconecta-border-subtle">
                <h4 className="font-semibold font-sora text-interconecta-text-primary mb-2">
                  ¿Ya tienes una cuenta?
                </h4>
                <p className="text-sm font-inter text-interconecta-text-secondary mb-4">
                  Si ya tienes una cuenta, puedes iniciar sesión directamente
                </p>
                <Link to="/auth/login">
                  <Button variant="outline" className="w-full border-interconecta-primary text-interconecta-primary">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
