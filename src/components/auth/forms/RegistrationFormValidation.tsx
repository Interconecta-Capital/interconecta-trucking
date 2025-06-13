
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

export function useRegistrationValidation() {
  const { validateEmail, validatePassword, sanitizeInput } = useSimpleAuth();

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

  const validateForm = (formData: {
    email: string;
    password: string;
    confirmPassword: string;
    nombre: string;
    rfc: string;
  }): { isValid: boolean; errors: Record<string, string> } => {
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
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  return {
    validateForm,
    validateRFC,
    sanitizeInput
  };
}
