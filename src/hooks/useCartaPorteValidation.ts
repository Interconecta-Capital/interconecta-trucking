
import { useState, useCallback } from 'react';
import { XMLValidator, ValidationResult } from '@/services/xmlValidator';
import { useToast } from '@/hooks/use-toast';

export const useCartaPorteValidation = () => {
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateCartaPorte = useCallback(async (cartaPorteData: any) => {
    setIsValidating(true);
    
    try {
      // Validar reglas de negocio
      const businessValidation = XMLValidator.validateBusinessRules(cartaPorteData);
      
      setValidationResults(businessValidation);
      
      if (businessValidation.isValid) {
        toast({
          title: "Validación exitosa",
          description: "La Carta Porte cumple con todas las validaciones requeridas.",
        });
      } else {
        toast({
          title: "Errores de validación",
          description: `Se encontraron ${businessValidation.errors.length} errores que deben corregirse.`,
          variant: "destructive"
        });
      }
      
      if (businessValidation.warnings.length > 0) {
        toast({
          title: "Advertencias",
          description: `${businessValidation.warnings.length} advertencias encontradas.`,
          variant: "default"
        });
      }
      
      return businessValidation;
    } catch (error) {
      console.error('Error en validación:', error);
      const errorResult: ValidationResult = {
        isValid: false,
        errors: ['Error interno de validación'],
        warnings: []
      };
      setValidationResults(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const validateXML = useCallback((xmlObject: any) => {
    setIsValidating(true);
    
    try {
      const xmlValidation = XMLValidator.validateCartaPorteXML(xmlObject);
      setValidationResults(xmlValidation);
      
      if (xmlValidation.isValid) {
        toast({
          title: "XML válido",
          description: "El XML generado cumple con el esquema SAT.",
        });
      } else {
        toast({
          title: "XML inválido",
          description: "El XML no cumple con el esquema requerido por el SAT.",
          variant: "destructive"
        });
      }
      
      return xmlValidation;
    } catch (error) {
      console.error('Error validando XML:', error);
      const errorResult: ValidationResult = {
        isValid: false,
        errors: ['Error validando estructura XML'],
        warnings: []
      };
      setValidationResults(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const clearValidation = useCallback(() => {
    setValidationResults(null);
  }, []);

  return {
    validationResults,
    isValidating,
    validateCartaPorte,
    validateXML,
    clearValidation
  };
};
