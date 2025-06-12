
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const useAuthValidation = () => {
  const validateUniqueRFC = async (rfc: string): Promise<ValidationResult> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('rfc', rfc.toUpperCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        return {
          isValid: false,
          message: 'Este RFC ya está registrado en el sistema. Si ya tienes una cuenta, inicia sesión.'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating RFC:', error);
      return {
        isValid: false,
        message: 'Error al validar RFC. Intenta nuevamente.'
      };
    }
  };

  const validateUniqueEmail = async (email: string): Promise<ValidationResult> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        return {
          isValid: false,
          message: 'Este correo ya está registrado. Inicia sesión o usa "¿Olvidaste tu contraseña?"'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating email:', error);
      return {
        isValid: false,
        message: 'Error al validar correo. Intenta nuevamente.'
      };
    }
  };

  const formatRFC = (rfc: string): string => {
    return rfc.toUpperCase().replace(/\s/g, '');
  };

  const validateRFCFormat = (rfc: string): ValidationResult => {
    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    const formattedRFC = formatRFC(rfc);
    
    if (!rfcPattern.test(formattedRFC)) {
      return {
        isValid: false,
        message: 'Formato de RFC inválido. Debe tener 12 o 13 caracteres.'
      };
    }

    return { isValid: true };
  };

  return {
    validateUniqueRFC,
    validateUniqueEmail,
    validateRFCFormat,
    formatRFC
  };
};
