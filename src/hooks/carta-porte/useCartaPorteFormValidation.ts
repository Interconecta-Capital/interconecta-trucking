
import { useMemo } from 'react';
import { useCartaPorteValidationEnhanced } from './useCartaPorteValidationEnhanced';
import { useCartaPorteMappers, CartaPorteFormData } from './useCartaPorteMappers';
import { CartaPorteData } from '@/types/cartaPorte';
import { StepValidations } from './types/useCartaPorteFormTypes';

interface UseCartaPorteFormValidationOptions {
  formDataForValidation: CartaPorteFormData;
  enableAI?: boolean;
}

export const useCartaPorteFormValidation = ({ 
  formDataForValidation, 
  enableAI = true 
}: UseCartaPorteFormValidationOptions) => {
  const { formDataToCartaPorteData } = useCartaPorteMappers();

  // Transform formData to CartaPorteData for validation
  const transformedData: CartaPorteData = useMemo(() => {
    return formDataToCartaPorteData(formDataForValidation);
  }, [formDataForValidation, formDataToCartaPorteData]);

  // Usar validaciones mejoradas con IA con datos transformados
  const validationResult = useCartaPorteValidationEnhanced({ 
    formData: transformedData,
    enableAI 
  });

  const { 
    stepValidations: rawStepValidations, 
    totalProgress,
    aiValidation,
    hasAIEnhancements,
    validationMode,
    overallScore,
    validateComplete
  } = validationResult;

  // Convertir las validaciones al formato correcto de forma estable
  const stepValidations: StepValidations = useMemo(() => ({
    configuracion: rawStepValidations?.configuracion || false,
    ubicaciones: rawStepValidations?.ubicaciones || false,
    mercancias: rawStepValidations?.mercancias || false,
    autotransporte: rawStepValidations?.autotransporte || false,
    figuras: rawStepValidations?.figuras || false,
  }), [rawStepValidations]);

  return {
    stepValidations,
    totalProgress: totalProgress || 0,
    aiValidation,
    hasAIEnhancements: hasAIEnhancements || false,
    validationMode: validationMode || 'standard',
    overallScore: overallScore || 0,
    validateComplete
  };
};
