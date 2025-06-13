
import React, { useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { ImprovedAuthCard } from './ImprovedAuthCard';
import { ImprovedFormField } from './ImprovedFormField';
import { ImprovedSocialButton } from './ImprovedSocialButton';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, Building, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function EnhancedRegisterForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    empresa: '',
    telefono: '',
    rfc: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp, signInWithGoogle } = useSimpleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos obligatorios');
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

    setIsLoading(true);
    
    try {
      const success = await signUp(
        formData.email, 
        formData.password, 
        {
          nombre: formData.nombre,
          empresa: formData.empresa || undefined,
          rfc: formData.rfc || undefined,
          telefono: formData.telefono || undefined
        }
      );
      
      if (success) {
        toast.success('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoogleRegister = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google register error:', error);
      toast.error('Error al registrarse con Google');
    }
  };

  return (
    <ImprovedAuthCard
      title="Crear Cuenta"
      description="Únete a la plataforma de gestión de transporte más avanzada"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImprovedFormField
          id="nombre"
          label="Nombre Completo"
          type="text"
          value={formData.nombre}
          onChange={(value) => handleInputChange('nombre', value)}
          placeholder="Tu nombre completo"
          required
          icon={<User className="h-4 w-4 text-gray-500" />}
        />

        <ImprovedFormField
          id="email"
          label="Correo Electrónico"
          type="email"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value)}
          placeholder="tu@empresa.com"
          required
          icon={<Mail className="h-4 w-4 text-gray-500" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImprovedFormField
            id="password"
            label="Contraseña"
            value={formData.password}
            onChange={(value) => handleInputChange('password', value)}
            required
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            icon={<Lock className="h-4 w-4 text-gray-500" />}
          />

          <ImprovedFormField
            id="confirmPassword"
            label="Confirmar Contraseña"
            value={formData.confirmPassword}
            onChange={(value) => handleInputChange('confirmPassword', value)}
            required
            showPasswordToggle
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            icon={<Lock className="h-4 w-4 text-gray-500" />}
          />
        </div>

        <ImprovedFormField
          id="empresa"
          label="Empresa (Opcional)"
          type="text"
          value={formData.empresa}
          onChange={(value) => handleInputChange('empresa', value)}
          placeholder="Nombre de tu empresa"
          icon={<Building className="h-4 w-4 text-gray-500" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImprovedFormField
            id="telefono"
            label="Teléfono (Opcional)"
            type="tel"
            value={formData.telefono}
            onChange={(value) => handleInputChange('telefono', value)}
            placeholder="+52 55 1234 5678"
            icon={<Phone className="h-4 w-4 text-gray-500" />}
          />

          <ImprovedFormField
            id="rfc"
            label="RFC (Opcional)"
            type="text"
            value={formData.rfc}
            onChange={(value) => handleInputChange('rfc', value.toUpperCase())}
            placeholder="XAXX010101000"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary text-white font-sora font-semibold py-6 text-lg shadow-lg transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creando cuenta...
            </div>
          ) : (
            'Crear Cuenta'
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500 font-inter">O regístrate con</span>
          </div>
        </div>

        <ImprovedSocialButton 
          provider="google" 
          onClick={handleGoogleRegister}
          actionText="Registrarse con Google"
        />
      </form>
    </ImprovedAuthCard>
  );
}
