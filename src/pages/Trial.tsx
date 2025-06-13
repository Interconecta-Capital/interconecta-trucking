
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useCustomEmails } from '@/hooks/useCustomEmails';
import { ImprovedSocialButton } from '@/components/auth/ImprovedSocialButton';
import { ImprovedFormField } from '@/components/auth/ImprovedFormField';
import { toast } from 'sonner';
import { ArrowLeft, Check, Calendar, User, Building, Mail, Lock, Phone, Hash, RefreshCw, Star } from 'lucide-react';

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
  
  const { signUp, signInWithGoogle, validateEmail, validatePassword, sanitizeInput } = useSimpleAuth();
  const { sendWelcomeEmail } = useCustomEmails();
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

    if (formData.rfc) {
      const rfcCheck = validateRFCFormat(formData.rfc);
      if (!rfcCheck.isValid) {
        toast.error(rfcCheck.message);
        return;
      }
    }

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
        await sendWelcomeEmail(formData.email, formData.nombre);
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
    const sanitizedValue = field === 'rfc' ? value.toUpperCase() : sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));

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

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error('Error al autenticar con Google');
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-interconecta-bg-alternate via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl">
                  <Check className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold font-sora bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ¡Registro Exitoso!
            </CardTitle>
            <CardDescription className="font-inter text-gray-600 text-lg mt-2">
              Revisa tu correo para verificar tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6 px-8 pb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-inter">
                Hemos enviado un correo de verificación a <strong>{formData.email}</strong>. 
                Haz clic en el enlace del correo para activar tu cuenta y comenzar tu prueba gratuita.
              </p>
            </div>
            <Button
              onClick={() => setShowVerification(false)}
              variant="outline"
              className="w-full border-green-500 text-green-600 hover:bg-green-50"
            >
              Volver al registro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-interconecta-bg-alternate via-white to-blue-50">
      {/* Header mejorado */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-interconecta-primary to-interconecta-accent rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img 
                src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
                alt="Interconecta Trucking Logo"
                className="relative h-10 w-10 rounded-lg"
              />
            </div>
            <span className="text-xl font-bold font-sora bg-gradient-to-r from-interconecta-primary to-interconecta-accent bg-clip-text text-transparent">
              Interconecta Trucking
            </span>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" className="border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero section mejorado */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full px-6 py-3 mb-8 shadow-sm">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-inter font-semibold text-blue-700">
                Prueba Gratuita por 14 Días
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold font-sora bg-gradient-to-r from-interconecta-primary via-blue-600 to-interconecta-accent bg-clip-text text-transparent mb-6 leading-tight">
              Comienza tu prueba gratuita
            </h1>
            <p className="text-xl font-inter text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Accede a todas las funciones de Interconecta Trucking sin costo por 14 días. 
              No se requiere tarjeta de crédito.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Formulario mejorado */}
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-sora bg-gradient-to-r from-interconecta-primary to-interconecta-accent bg-clip-text text-transparent">
                  Crear cuenta de prueba
                </CardTitle>
                <CardDescription className="font-inter text-gray-600">
                  Completa el formulario para comenzar tu prueba gratuita
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImprovedSocialButton
                  provider="google"
                  actionText="Registrarse con Google"
                  onClick={handleGoogleAuth}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-500 font-inter font-medium">
                      O regístrate con email
                    </span>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <ImprovedFormField
                      id="nombre"
                      label="Nombre Completo"
                      value={formData.nombre}
                      onChange={(value) => handleChange('nombre', value)}
                      required
                      icon={<User className="h-4 w-4 text-gray-500" />}
                    />
                    <ImprovedFormField
                      id="telefono"
                      label="Teléfono"
                      value={formData.telefono}
                      onChange={(value) => handleChange('telefono', value)}
                      icon={<Phone className="h-4 w-4 text-gray-500" />}
                    />
                  </div>
                  
                  <ImprovedFormField
                    id="empresa"
                    label="Nombre de la Empresa"
                    value={formData.empresa}
                    onChange={(value) => handleChange('empresa', value)}
                    required
                    icon={<Building className="h-4 w-4 text-gray-500" />}
                  />
                  
                  <ImprovedFormField
                    id="rfc"
                    label="RFC de la Empresa"
                    value={formData.rfc}
                    onChange={(value) => handleChange('rfc', value)}
                    maxLength={13}
                    error={!rfcValidation.isValid ? rfcValidation.message : undefined}
                    icon={<Hash className="h-4 w-4 text-gray-500" />}
                  />
                  
                  <ImprovedFormField
                    id="email"
                    label="Correo Electrónico"
                    type="email"
                    value={formData.email}
                    onChange={(value) => handleChange('email', value)}
                    required
                    icon={<Mail className="h-4 w-4 text-gray-500" />}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <ImprovedFormField
                      id="password"
                      label="Contraseña"
                      value={formData.password}
                      onChange={(value) => handleChange('password', value)}
                      required
                      showPasswordToggle
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      icon={<Lock className="h-4 w-4 text-gray-500" />}
                    />
                    
                    <ImprovedFormField
                      id="confirm-password"
                      label="Confirmar"
                      value={formData.confirmPassword}
                      onChange={(value) => handleChange('confirmPassword', value)}
                      required
                      showPasswordToggle
                      showPassword={showConfirmPassword}
                      onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                      icon={<Lock className="h-4 w-4 text-gray-500" />}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary font-sora font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]" 
                    disabled={loading || !rfcValidation.isValid}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Creando cuenta...
                      </div>
                    ) : (
                      'Comenzar Prueba Gratuita'
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center font-inter">
                    Al registrarte, aceptas nuestros términos de servicio y política de privacidad
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Beneficios mejorados */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold font-sora bg-gradient-to-r from-interconecta-primary to-interconecta-accent bg-clip-text text-transparent mb-6">
                  ¿Qué incluye tu prueba gratuita?
                </h3>
                
                <div className="space-y-4">
                  {[
                    { icon: '📋', text: 'Cartas porte ilimitadas por 14 días' },
                    { icon: '🚛', text: 'Gestión completa de flota y conductores' },
                    { icon: '📊', text: 'Dashboard con analytics en tiempo real' },
                    { icon: '🎯', text: 'Soporte técnico completo' },
                    { icon: '⭐', text: 'Todas las funciones premium' },
                    { icon: '👥', text: 'Sin límites de usuarios' }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="text-2xl">{benefit.icon}</div>
                      <span className="font-inter text-gray-700 font-medium">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold font-sora text-blue-900 mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    ¿Ya tienes una cuenta?
                  </h4>
                  <p className="text-sm font-inter text-blue-700 mb-4">
                    Si ya tienes una cuenta, puedes iniciar sesión directamente
                  </p>
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="outline" 
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 font-inter"
                  >
                    Iniciar Sesión
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
