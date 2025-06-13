
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useCustomEmails } from '@/hooks/useCustomEmails';
import { ImprovedAuthCard } from './ImprovedAuthCard';
import { ImprovedSocialButton } from './ImprovedSocialButton';
import { RegistrationFormFields } from './forms/RegistrationFormFields';
import { useRegistrationFormState } from './forms/RegistrationFormState';
import { useRegistrationValidation } from './forms/RegistrationFormValidation';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EnhancedRegisterForm() {
  const {
    formData,
    showPassword,
    showConfirmPassword,
    isLoading,
    fieldErrors,
    setShowPassword,
    setShowConfirmPassword,
    setIsLoading,
    setFieldErrors,
    handleInputChange,
    resetForm
  } = useRegistrationFormState();

  const { validateForm, sanitizeInput } = useRegistrationValidation();
  const { signUp, signInWithGoogle } = useSimpleAuth();
  const { sendWelcomeEmail } = useCustomEmails();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
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
        resetForm();
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
          <RegistrationFormFields
            formData={formData}
            fieldErrors={fieldErrors}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            onInputChange={(field, value) => handleInputChange(field, value, sanitizeInput)}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
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
