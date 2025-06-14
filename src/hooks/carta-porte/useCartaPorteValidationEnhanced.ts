
import { useMemo, useState, useEffect } from 'react';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { useCartaPorteValidation } from '@/hooks/carta-porte/useCartaPorteValidation';
import { useAIValidationEnhanced, AIValidationEnhanced } from '@/hooks/ai/useAIValidationEnhanced';

interface UseCartaPorteValidationEnhancedOptions {
  formData: CartaPorteData;
  enableAI?: boolean;
}

export interface EnhancedValidationResult {
  // Validaciones tradicionales (mantener exactamente igual)
  stepValidations: {
    configuracion: boolean;
    ubicaciones: boolean;
    mercancias: boolean;
    autotransporte: boolean;
    figuras: boolean;
  };
  totalProgress: number;
  
  // Nuevas validaciones IA
  aiValidation?: AIValidationEnhanced;
  hasAIEnhancements: boolean;
  validationMode: 'traditional' | 'ai-enhanced';
  overallScore: number;
}

export function useCartaPorteValidationEnhanced({ 
  formData, 
  enableAI = true 
}: UseCartaPorteValidationEnhancedOptions): EnhancedValidationResult {
  // Mantener validaciones tradicionales intactas
  const { stepValidations, totalProgress } = useCartaPorteValidation({ formData });
  
  // Nuevas validaciones IA
  const { validateCompleteWithAI } = useAIValidationEnhanced();
  const [aiValidation, setAiValidation] = useState<AIValidationEnhanced | undefined>();
  const [isValidating, setIsValidating] = useState(false);

  // Ejecutar validación IA cuando cambian los datos principales
  useEffect(() => {
    if (!enableAI) return;

    const shouldValidate = formData.rfcEmisor && formData.rfcReceptor && 
                          (formData.ubicaciones?.length || 0) > 0;

    if (shouldValidate && !isValidating) {
      setIsValidating(true);
      
      // Debounce validation
      const timeout = setTimeout(async () => {
        try {
          const result = await validateCompleteWithAI(formData);
          setAiValidation(result);
        } catch (error) {
          console.error('Error in AI validation:', error);
          setAiValidation(undefined);
        } finally {
          setIsValidating(false);
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [
    formData.rfcEmisor,
    formData.rfcReceptor,
    formData.ubicaciones?.length,
    formData.mercancias?.length,
    formData.autotransporte?.placaVm,
    formData.figuras?.length,
    enableAI,
    isValidating,
    validateCompleteWithAI
  ]);

  // Calcular score general combinando tradicional + IA
  const overallScore = useMemo(() => {
    const traditionalScore = totalProgress;
    
    if (!aiValidation?.aiEnhancements) {
      return traditionalScore;
    }

    // Combinar scores: 70% tradicional + 30% IA
    const combinedScore = (traditionalScore * 0.7) + (aiValidation.validationScore * 0.3);
    return Math.round(combinedScore);
  }, [totalProgress, aiValidation]);

  return {
    // Mantener estructura tradicional exactamente igual
    stepValidations,
    totalProgress,
    
    // Agregar capacidades IA
    aiValidation,
    hasAIEnhancements: !!aiValidation?.aiEnhancements,
    validationMode: aiValidation?.aiEnhancements ? 'ai-enhanced' : 'traditional',
    overallScore
  };
}
