
import { useMemo } from 'react';
import { useCartaPorteValidationEnhanced } from './useCartaPorteValidationEnhanced';
import { useCartaPorteMappers, CartaPorteFormData } from './useCartaPorteMappers';
import { CartaPorteData } from '@/types/cartaPorte';

interface StepValidations {
  configuracion: boolean;
  ubicaciones: boolean;
  mercancias: boolean;
  autotransporte: boolean;
  figuras: boolean;
}

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
    data: transformedData,
    enableAI 
  });

  const { 
    isValid,
    errors,
    warnings,
    score
  } = validationResult;

  // Create step validations based on the data
  const stepValidations: StepValidations = useMemo(() => ({
    configuracion: !!(transformedData.rfcEmisor && transformedData.rfcReceptor),
    ubicaciones: !!(transformedData.ubicaciones && transformedData.ubicaciones.length >= 2),
    mercancias: !!(transformedData.mercancias && transformedData.mercancias.length > 0),
    autotransporte: !!(transformedData.autotransporte && transformedData.autotransporte.placa_vm),
    figuras: !!(transformedData.figuras && transformedData.figuras.length > 0),
  }), [transformedData]);

  const totalProgress = useMemo(() => {
    const validSteps = Object.values(stepValidations).filter(Boolean).length;
    return Math.round((validSteps / Object.keys(stepValidations).length) * 100);
  }, [stepValidations]);

  const validateComplete = () => {
    return Object.values(stepValidations).every(Boolean) && isValid;
  };

  return {
    stepValidations,
    totalProgress,
    aiValidation: { isValid, errors, warnings },
    hasAIEnhancements: enableAI,
    validationMode: enableAI ? 'enhanced' : 'standard',
    overallScore: score || 0,
    validateComplete
  };
};
