import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSecureAuth } from '@/hooks/auth/useSecureAuth';
import { useAuthValidation } from '@/hooks/auth/useAuthValidation';
import { toast } from 'sonner';
import { ArrowLeft, Check, Calendar, Eye, EyeOff } from 'lucide-react';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { EmailVerificationMessage } from '@/components/auth/EmailVerificationMessage';
import { UnconfirmedUserDialog } from '@/components/auth/UnconfirmedUserDialog';
import { useUnconfirmedUserDetection } from '@/hooks/useUnconfirmedUserDetection';
import { ContextualAlert } from '@/components/ui/contextual-alert';

export default function Trial() {
  const {
    unconfirmedEmail,
    showUnconfirmedDialog,
    checkIfUserIsUnconfirmed,
    closeUnconfirmedDialog,
    handleVerificationSent,
  } = useUnconfirmedUserDetection();

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
  const [showExistingUserAlert, setShowExistingUserAlert] = useState(false);
  const [existingUserEmail, setExistingUserEmail] = useState('');
  const [rfcValidation, setRfcValidation] = useState({ isValid: true, message: '' });
  
  const { secureRegister } = useSecureAuth();
  const { validateRFCFormat, sanitizeInput } = useAuthValidation();
  const navigate = useNavigate();

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

    setLoading(true);
    setShowExistingUserAlert(false);

    try {
      const success = await secureRegister(
        formData.email,
        formData.password,
        formData.nombre,
        formData.rfc,
        formData.empresa,
        formData.telefono
      );
      
      if (success) {
        setShowVerification(true);
      }
    } catch (error: any) {
      // Check if this is an existing user (repeated signup)
      if (error.message?.includes('User already registered') || 
          error.message?.includes('already registered') ||
          error.message?.includes('user_repeated_signup')) {
        setExistingUserEmail(formData.email);
        setShowExistingUserAlert(true);
        return;
      }

      // Check if this might be an existing unconfirmed user
      const isUnconfirmed = checkIfUserIsUnconfirmed(formData.email, error);
      
      if (!isUnconfirmed) {
        toast.error(error.message || 'Error al iniciar la prueba gratuita');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear alerts when user starts typing
    if (field === 'email' && showExistingUserAlert) {
      setShowExistingUserAlert(false);
    }

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
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-05">
      {/* Header */}
      <header className="bg-pure-white border-b border-gray-20 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-screen-xl">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
              alt="Interconecta Trucking Logo"
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-xl font-bold text-pure-black">
              Interconecta Trucking
            </span>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" className="border-gray-30 text-gray-70 hover:border-blue-interconecta hover:text-blue-interconecta">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-screen-xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-light border border-blue-interconecta/20 rounded-full px-4 py-2 mb-6">
              <Calendar className="h-4 w-4 text-blue-interconecta mr-2" />
              <span className="text-sm font-medium text-blue-interconecta">
                Prueba Gratuita por 14 Días
              </span>
            </div>
            
            <h1 className="text-display font-bold text-pure-black mb-6">
              Comienza tu prueba gratuita
            </h1>
            <p className="text-body-xl text-gray-60 max-w-2xl mx-auto">
              Accede a todas las funciones de Interconecta Trucking sin costo por 14 días. 
              No se requiere tarjeta de crédito.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulario */}
            {showVerification ? (
              <EmailVerificationMessage 
                email={formData.email}
                onBack={() => setShowVerification(false)}
              />
            ) : (
              <Card className="card-premium border-gray-20 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-subtitle font-bold text-pure-black">Crear cuenta de prueba</CardTitle>
                  <CardDescription className="text-gray-60">
                    Completa el formulario para comenzar tu prueba gratuita
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Alert for existing user */}
                    {showExistingUserAlert && (
                      <ContextualAlert
                        type="warning"
                        title="Cuenta existente encontrada"
                        message={`Ya tienes una cuenta registrada con ${existingUserEmail}. Inicia sesión para continuar.`}
                        action={{
                          label: 'Ir a iniciar sesión',
                          onClick: goToLogin
                        }}
                        dismissible
                        onDismiss={() => setShowExistingUserAlert(false)}
                      />
                    )}

                    <SocialAuthButtons mode="register" />
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre" className="text-gray-70 font-medium">Nombre Completo</Label>
                          <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => handleChange('nombre', e.target.value)}
                            required
                            className="border-gray-30 focus:border-blue-interconecta"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono" className="text-gray-70 font-medium">Teléfono</Label>
                          <Input
                            id="telefono"
                            value={formData.telefono}
                            onChange={(e) => handleChange('telefono', e.target.value)}
                            className="border-gray-30 focus:border-blue-interconecta"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="empresa" className="text-gray-70 font-medium">Nombre de la Empresa</Label>
                        <Input
                          id="empresa"
                          value={formData.empresa}
                          onChange={(e) => handleChange('empresa', e.target.value)}
                          required
                          className="border-gray-30 focus:border-blue-interconecta"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="rfc" className="text-gray-70 font-medium">RFC de la Empresa</Label>
                        <Input
                          id="rfc"
                          value={formData.rfc}
                          onChange={(e) => handleChange('rfc', e.target.value.toUpperCase())}
                          required
                          maxLength={13}
                          className={`border-gray-30 focus:border-blue-interconecta ${
                            !rfcValidation.isValid ? 'border-red-500' : ''
                          }`}
                        />
                        {!rfcValidation.isValid && (
                          <p className="text-red-500 text-sm">{rfcValidation.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-70 font-medium">Correo Electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          required
                          className="border-gray-30 focus:border-blue-interconecta"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-70 font-medium">Contraseña</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            required
                            minLength={8}
                            className="border-gray-30 focus:border-blue-interconecta pr-10"
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
                        <Label htmlFor="confirm-password" className="text-gray-70 font-medium">Confirmar Contraseña</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            required
                            className="border-gray-30 focus:border-blue-interconecta pr-10"
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
                        className="w-full bg-blue-interconecta hover:bg-blue-hover text-pure-white py-3 text-base font-semibold" 
                        disabled={loading || !rfcValidation.isValid}
                      >
                        {loading ? 'Creando cuenta...' : 'Comenzar Prueba Gratuita'}
                      </Button>
                      
                      <p className="text-xs text-gray-60 text-center">
                        Al registrarte, aceptas nuestros términos de servicio y política de privacidad
                      </p>
                    </form>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Beneficios */}
            <div className="space-y-6">
              <h3 className="text-subtitle font-bold text-pure-black">
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
                    <span className="text-gray-70">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="card-premium p-6 bg-blue-light border border-blue-interconecta/20">
                <h4 className="font-semibold text-pure-black mb-2">
                  ¿Ya tienes una cuenta?
                </h4>
                <p className="text-sm text-gray-60 mb-4">
                  Si ya tienes una cuenta, puedes iniciar sesión directamente
                </p>
                <Link to="/auth/login">
                  <Button variant="outline" className="w-full border-blue-interconecta text-blue-interconecta hover:bg-blue-light">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Unconfirmed User Dialog */}
      {showUnconfirmedDialog && unconfirmedEmail && (
        <UnconfirmedUserDialog
          email={unconfirmedEmail}
          onClose={closeUnconfirmedDialog}
          onVerificationSent={() => {
            handleVerificationSent();
            setShowVerification(true);
          }}
        />
      )}
    </div>
  );
}
