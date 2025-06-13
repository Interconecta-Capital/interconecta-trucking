
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { toast } from 'sonner';
import { ArrowLeft, Check, Calendar, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [rfcValidation, setRfcValidation] = useState({ isValid: true, message: '' });
  
  const { signUp, validateEmail, validatePassword, sanitizeInput } = useSimpleAuth();
  const navigate = useNavigate();

  const validateRFCFormat = (rfc: string) => {
    if (!rfc) return { isValid: true, message: '' };
    
    if (rfc.length < 12 || rfc.length > 13) {
      return { isValid: false, message: 'RFC debe tener 12 o 13 caracteres' };
    }
    
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfcRegex.test(rfc.toUpperCase())) {
      return { isValid: false, message: 'Formato de RFC inválido' };
    }
    
    return { isValid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validate RFC format if provided
    if (formData.rfc) {
      const rfcCheck = validateRFCFormat(formData.rfc);
      if (!rfcCheck.isValid) {
        toast.error(rfcCheck.message);
        return;
      }
    }

    // Validate required fields
    if (!formData.nombre || !formData.empresa || !formData.email) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      const success = await signUp(
        formData.email,
        formData.password,
        {
          nombre: formData.nombre,
          empresa: formData.empresa,
          rfc: formData.rfc || undefined,
          telefono: formData.telefono || undefined
        }
      );
      
      if (success) {
        setShowVerification(true);
      }
    } catch (error: any) {
      console.error('Trial registration error:', error);
      toast.error(error.message || 'Error al iniciar la prueba gratuita');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));

    // Real-time RFC validation
    if (field === 'rfc' && sanitizedValue) {
      const validation = validateRFCFormat(sanitizedValue);
      setRfcValidation({ 
        isValid: validation.isValid, 
        message: validation.message || '' 
      });
    } else if (field === 'rfc' && !sanitizedValue) {
      setRfcValidation({ isValid: true, message: '' });
    }
  };

  const goToLogin = () => {
    navigate('/auth');
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-interconecta-bg-alternate to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-interconecta-border-subtle">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="interconecta-gradient p-3 rounded-xl">
                <Check className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold font-sora text-interconecta-text-primary">
              ¡Registro Exitoso!
            </CardTitle>
            <CardDescription className="font-inter text-interconecta-text-secondary">
              Revisa tu correo para verificar tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-interconecta-text-body">
              Hemos enviado un correo de verificación a <strong>{formData.email}</strong>. 
              Haz clic en el enlace del correo para activar tu cuenta.
            </p>
            <Button
              onClick={() => setShowVerification(false)}
              variant="outline"
              className="w-full"
            >
              Volver al registro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                        <Label htmlFor="nombre" className="font-inter">Nombre Completo *</Label>
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
                      <Label htmlFor="empresa" className="font-inter">Nombre de la Empresa *</Label>
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
                        maxLength={13}
                        className={`border-interconecta-border-subtle ${
                          !rfcValidation.isValid ? 'border-red-500' : ''
                        }`}
                      />
                      {!rfcValidation.isValid && (
                        <p className="text-red-500 text-sm">{rfcValidation.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-inter">Correo Electrónico *</Label>
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
                      <Label htmlFor="password" className="font-inter">Contraseña *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          required
                          minLength={8}
                          className="border-interconecta-border-subtle pr-10"
                          placeholder="Mínimo 8 caracteres"
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="font-inter">Confirmar Contraseña *</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange('confirmPassword', e.target.value)}
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
                      className="w-full bg-interconecta-primary hover:bg-interconecta-accent font-sora text-lg py-3" 
                      disabled={loading || !rfcValidation.isValid}
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
                <Button
                  onClick={goToLogin}
                  variant="outline" 
                  className="w-full border-interconecta-primary text-interconecta-primary"
                >
                  Iniciar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
