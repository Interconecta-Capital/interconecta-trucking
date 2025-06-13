
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { toast } from 'sonner';
import { Truck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SimpleRegisterForm() {
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

  const { signUp, validateEmail, validatePassword, sanitizeInput } = useSimpleAuth();

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateRFC = (rfc: string) => {
    if (!rfc) return { isValid: true }; // RFC is optional
    
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
    
    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message || 'Email inválido';
    }
    
    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message || 'Contraseña inválida';
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    // Required fields
    if (!formData.nombre.trim()) {
      errors.nombre = 'Nombre es requerido';
    }
    
    // RFC validation if provided
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
        // Reset form
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-interconecta-bg-alternate to-white p-4">
      <Card className="w-full max-w-md border-interconecta-border-subtle">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="interconecta-gradient p-3 rounded-xl">
              <Truck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold font-sora text-interconecta-text-primary">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="font-inter text-interconecta-text-secondary">
            Únete a Interconecta Trucking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@empresa.com"
                required
                className={fieldErrors.email ? 'border-red-500' : ''}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className={fieldErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className={fieldErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Tu nombre completo"
                required
                className={fieldErrors.nombre ? 'border-red-500' : ''}
              />
              {fieldErrors.nombre && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {fieldErrors.nombre}
                </p>
              )}
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                type="text"
                value={formData.empresa}
                onChange={(e) => handleInputChange('empresa', e.target.value)}
                placeholder="Nombre de tu empresa"
              />
            </div>

            {/* RFC */}
            <div className="space-y-2">
              <Label htmlFor="rfc">RFC</Label>
              <Input
                id="rfc"
                type="text"
                value={formData.rfc}
                onChange={(e) => handleInputChange('rfc', e.target.value.toUpperCase())}
                placeholder="XAXX010101000"
                maxLength={13}
                className={fieldErrors.rfc ? 'border-red-500' : ''}
              />
              {fieldErrors.rfc && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {fieldErrors.rfc}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                placeholder="55 1234 5678"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-interconecta-primary hover:bg-interconecta-accent font-sora font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-interconecta-border-subtle">
            <div className="text-center">
              <p className="text-sm text-interconecta-text-secondary font-inter">
                ¿Ya tienes cuenta?{' '}
                <Link 
                  to="/auth"
                  className="text-interconecta-primary hover:text-interconecta-accent underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
