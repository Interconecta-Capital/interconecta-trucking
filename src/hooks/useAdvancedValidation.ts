
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ValidationResult {
  isValid: boolean;
  message?: string;
  data?: any;
}

export const useAdvancedValidation = () => {
  const [validationStates, setValidationStates] = useState<Record<string, 'idle' | 'validating' | 'valid' | 'invalid'>>({});

  const validateRFC = useCallback(async (rfc: string, tipoPersona?: 'fisica' | 'moral'): Promise<ValidationResult> => {
    setValidationStates(prev => ({ ...prev, rfc: 'validating' }));
    
    try {
      if (!rfc || rfc.length < 12 || rfc.length > 13) {
        setValidationStates(prev => ({ ...prev, rfc: 'invalid' }));
        return { isValid: false, message: 'RFC debe tener entre 12 y 13 caracteres' };
      }

      // Basic RFC pattern validation
      const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
      if (!rfcPattern.test(rfc)) {
        setValidationStates(prev => ({ ...prev, rfc: 'invalid' }));
        return { isValid: false, message: 'Formato de RFC inválido' };
      }

      // Validate based on person type
      if (tipoPersona === 'fisica' && rfc.length !== 13) {
        setValidationStates(prev => ({ ...prev, rfc: 'invalid' }));
        return { isValid: false, message: 'RFC de persona física debe tener 13 caracteres' };
      }

      if (tipoPersona === 'moral' && rfc.length !== 12) {
        setValidationStates(prev => ({ ...prev, rfc: 'invalid' }));
        return { isValid: false, message: 'RFC de persona moral debe tener 12 caracteres' };
      }

      setValidationStates(prev => ({ ...prev, rfc: 'valid' }));
      return { isValid: true, message: 'RFC válido' };
    } catch (error) {
      setValidationStates(prev => ({ ...prev, rfc: 'invalid' }));
      return { isValid: false, message: 'Error validando RFC' };
    }
  }, []);

  const validateCURP = useCallback(async (curp: string): Promise<ValidationResult> => {
    setValidationStates(prev => ({ ...prev, curp: 'validating' }));
    
    try {
      if (!curp || curp.length !== 18) {
        setValidationStates(prev => ({ ...prev, curp: 'invalid' }));
        return { isValid: false, message: 'CURP debe tener 18 caracteres' };
      }

      // Basic CURP pattern
      const curpPattern = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;
      if (!curpPattern.test(curp)) {
        setValidationStates(prev => ({ ...prev, curp: 'invalid' }));
        return { isValid: false, message: 'Formato de CURP inválido' };
      }

      setValidationStates(prev => ({ ...prev, curp: 'valid' }));
      return { isValid: true, message: 'CURP válido' };
    } catch (error) {
      setValidationStates(prev => ({ ...prev, curp: 'invalid' }));
      return { isValid: false, message: 'Error validando CURP' };
    }
  }, []);

  const validatePlaca = useCallback(async (placa: string): Promise<ValidationResult> => {
    setValidationStates(prev => ({ ...prev, placa: 'validating' }));
    
    try {
      if (!placa || placa.length < 6 || placa.length > 8) {
        setValidationStates(prev => ({ ...prev, placa: 'invalid' }));
        return { isValid: false, message: 'Formato de placa inválido' };
      }

      // Mexican license plate patterns
      const patterns = [
        /^[A-Z]{3}-[0-9]{3}$/, // ABC-123
        /^[0-9]{3}-[A-Z]{3}$/, // 123-ABC
        /^[A-Z]{2}-[0-9]{2}-[A-Z]{2}$/, // AB-12-CD
      ];

      const isValid = patterns.some(pattern => pattern.test(placa));
      
      if (!isValid) {
        setValidationStates(prev => ({ ...prev, placa: 'invalid' }));
        return { isValid: false, message: 'Formato de placa no reconocido' };
      }

      setValidationStates(prev => ({ ...prev, placa: 'valid' }));
      return { isValid: true, message: 'Placa válida' };
    } catch (error) {
      setValidationStates(prev => ({ ...prev, placa: 'invalid' }));
      return { isValid: false, message: 'Error validando placa' };
    }
  }, []);

  const validateLicencia = useCallback(async (numLicencia: string, vigencia?: string): Promise<ValidationResult> => {
    setValidationStates(prev => ({ ...prev, licencia: 'validating' }));
    
    try {
      if (!numLicencia || numLicencia.length < 8) {
        setValidationStates(prev => ({ ...prev, licencia: 'invalid' }));
        return { isValid: false, message: 'Número de licencia debe tener al menos 8 caracteres' };
      }

      // Check if license is expired
      if (vigencia) {
        const vigenciaDate = new Date(vigencia);
        const today = new Date();
        
        if (vigenciaDate < today) {
          setValidationStates(prev => ({ ...prev, licencia: 'invalid' }));
          return { isValid: false, message: 'Licencia vencida' };
        }
      }

      setValidationStates(prev => ({ ...prev, licencia: 'valid' }));
      return { isValid: true, message: 'Licencia válida' };
    } catch (error) {
      setValidationStates(prev => ({ ...prev, licencia: 'invalid' }));
      return { isValid: false, message: 'Error validando licencia' };
    }
  }, []);

  return {
    validationStates,
    validateRFC,
    validateCURP,
    validatePlaca,
    validateLicencia
  };
};
