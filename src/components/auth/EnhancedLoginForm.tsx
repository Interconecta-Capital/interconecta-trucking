
import React, { useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { ImprovedAuthCard } from './ImprovedAuthCard';
import { ImprovedFormField } from './ImprovedFormField';
import { ImprovedSocialButton } from './ImprovedSocialButton';
import { Button } from '@/components/ui/button';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function EnhancedLoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signInWithGoogle } = useSimpleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await signIn(formData.email, formData.password);
      
      if (success) {
        console.log('Login successful, redirect will happen automatically');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Error al iniciar sesión con Google');
    }
  };

  return (
    <ImprovedAuthCard
      title="Iniciar Sesión"
      description="Accede a tu plataforma de gestión de transporte"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary text-white font-sora font-semibold py-6 text-lg shadow-lg transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Iniciando sesión...
            </div>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500 font-inter">O continúa con</span>
          </div>
        </div>

        <ImprovedSocialButton 
          provider="google" 
          onClick={handleGoogleLogin}
          actionText="Iniciar sesión con Google"
        />
      </form>
    </ImprovedAuthCard>
  );
}
