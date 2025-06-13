
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useCustomEmails } from '@/hooks/useCustomEmails';
import { ImprovedAuthCard } from './ImprovedAuthCard';
import { ImprovedSocialButton } from './ImprovedSocialButton';
import { ImprovedFormField } from './ImprovedFormField';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Mail, Lock, User, Building, Hash, Phone, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EnhancedRegisterForm() {
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
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { signUp, signInWithGoogle, validateEmail, validatePassword, sanitizeInput } = useSimpleAuth();
  const { sendWelcomeEmail } = useCustomEmails();

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = field === 'rfc' ? value.toUpperCase() : sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateRFC = (rfc: string) => {
    if (!rfc) return { isValid: true };
    
    if (rfc.length < 12 || rfc.length > 13) {
      return { isValid: false, message: 'RFC debe tener 12 o 13 caracteres' };
    }
    
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfcRegex.test(rfc.toUpperCase())) {
      return { isValid: false, message: 'Formato de RFC inválido' };
    }
    
    return { isValid: true };
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message || 'Email inválido';
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message || 'Contraseña inválida';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'Nombre es requerido';
    }
    
    if (formData.rfc.trim()) {
      const rfcValidation = validateRFC(formData.rfc);
      if (!rfcValidation.isValid) {
        errors.rfc = rfcValidation.message || 'RFC inválido';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await signUp(
        formData.email,
        formData.password,
        {
          nombre: formData.nombre,
          empresa: formData.empresa || undefined,
          rfc: formData.rfc.toUpperCase() || undefined,
          telefono: formData.telefono || undefined
        }
      );
      
      if (success) {
        // Enviar email de bienvenida personalizado
        await sendWelcomeEmail(formData.email, formData.nombre);
        
        setFormData({
          email: '', password: '', confirmPassword: '',
          nombre: '', empresa: '', rfc: '', telefono: ''
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Error inesperado durante el registro');
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

  return (
    <ImprovedAuthCard
      title="Crear Cuenta"
      description="Únete a Interconecta Trucking"
    >
      <div className="space-y-6">
        <ImprovedSocialButton
          provider="google"
          actionText="Registrarse con Google"
          onClick={handleGoogleAuth}
        />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-500 font-inter font-medium">
              O regístrate con email
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImprovedFormField
            id="email"
            label="Correo Electrónico"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            placeholder="tu@empresa.com"
            required
            error={fieldErrors.email}
            icon={<Mail className="h-4 w-4 text-gray-500" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <ImprovedFormField
              id="password"
              label="Contraseña"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              required
              error={fieldErrors.password}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              icon={<Lock className="h-4 w-4 text-gray-500" />}
            />

            <ImprovedFormField
              id="confirmPassword"
              label="Confirmar"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              required
              error={fieldErrors.confirmPassword}
              showPasswordToggle
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              icon={<Lock className="h-4 w-4 text-gray-500" />}
            />
          </div>

          <ImprovedFormField
            id="nombre"
            label="Nombre Completo"
            value={formData.nombre}
            onChange={(value) => handleInputChange('nombre', value)}
            placeholder="Tu nombre completo"
            required
            error={fieldErrors.nombre}
            icon={<User className="h-4 w-4 text-gray-500" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <ImprovedFormField
              id="empresa"
              label="Empresa"
              value={formData.empresa}
              onChange={(value) => handleInputChange('empresa', value)}
              placeholder="Nombre de tu empresa"
              icon={<Building className="h-4 w-4 text-gray-500" />}
            />

            <ImprovedFormField
              id="telefono"
              label="Teléfono"
              type="tel"
              value={formData.telefono}
              onChange={(value) => handleInputChange('telefono', value)}
              placeholder="55 1234 5678"
              icon={<Phone className="h-4 w-4 text-gray-500" />}
            />
          </div>

          <ImprovedFormField
            id="rfc"
            label="RFC"
            value={formData.rfc}
            onChange={(value) => handleInputChange('rfc', value)}
            placeholder="XAXX010101000"
            maxLength={13}
            error={fieldErrors.rfc}
            icon={<Hash className="h-4 w-4 text-gray-500" />}
          />

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary font-sora font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Creando cuenta...
              </div>
            ) : (
              'Crear Cuenta'
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-inter">
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/auth"
                className="text-interconecta-primary hover:text-interconecta-accent font-medium underline decoration-2 underline-offset-2 hover:decoration-interconecta-accent transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </ImprovedAuthCard>
  );
}
