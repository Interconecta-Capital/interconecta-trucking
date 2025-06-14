
import { useMemo, useCallback } from 'react';
import { useCartaPorteValidation } from './useCartaPorteValidation';
import { useAIValidationEnhanced } from '../ai/useAIValidationEnhanced';
import { CartaPorteFormData } from './useCartaPorteMappers';

interface UseCartaPorteValidationEnhancedOptions {
  formData: CartaPorteFormData;
  enableAI?: boolean;
}

interface StepValidation {
  configuracion: boolean;
  ubicaciones: boolean;
  mercancias: boolean;
  autotransporte: boolean;
  figuras: boolean;
}

interface AIValidationEnhanced {
  isValid: boolean;
  aiSuggestions: Array<{
    type: 'warning' | 'suggestion' | 'error' | 'optimization';
    title: string;
    message: string;
    autoFix?: () => void;
    confidence: number;
  }>;
  aiWarnings: Array<{
    field: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  predictiveAlerts: Array<{
    field: string;
    prediction: string;
    confidence: number;
    action?: () => void;
  }>;
  aiEnhancements: boolean;
  validationScore: number;
}

export const useCartaPorteValidationEnhanced = ({ 
  formData, 
  enableAI = false 
}: UseCartaPorteValidationEnhancedOptions) => {
  const { validateComplete: validateTraditional } = useCartaPorteValidation();
  const { validateCompleteWithAI } = useAIValidationEnhanced();

  // Validaciones por step usando validación tradicional
  const stepValidations: StepValidation = useMemo(() => {
    const result = validateTraditional(formData);
    
    return {
      configuracion: !result.errors.configuracion || result.errors.configuracion.length === 0,
      ubicaciones: !result.errors.ubicaciones || result.errors.ubicaciones.length === 0,
      mercancias: !result.errors.mercancias || result.errors.mercancias.length === 0,
      autotransporte: !result.errors.autotransporte || result.errors.autotransporte.length === 0,
      figuras: !result.errors.figuras || result.errors.figuras.length === 0,
    };
  }, [formData, validateTraditional]);

  // Progreso total basado en validación tradicional
  const totalProgress = useMemo(() => {
    const validSteps = Object.values(stepValidations).filter(Boolean).length;
    return Math.round((validSteps / Object.keys(stepValidations).length) * 100);
  }, [stepValidations]);

  // Validación completa combinada (tradicional + AI)
  const validateComplete = useCallback(async (formDataInput?: CartaPorteFormData) => {
    const dataToValidate = formDataInput || formData;
    
    // Validación tradicional (base)
    const traditionalResult = validateTraditional(dataToValidate);
    
    if (!enableAI) {
      return {
        ...traditionalResult,
        aiEnhancements: null,
        overallScore: traditionalResult.completionPercentage,
        enhanced: false
      };
    }

    try {
      // Validación AI si está habilitada
      const aiResult = await validateCompleteWithAI(dataToValidate);
      
      // Combinar resultados (70% tradicional, 30% AI)
      const combinedScore = Math.round(
        (traditionalResult.completionPercentage * 0.7) +
        (aiResult.validationScore * 0.3)
      );

      return {
        ...traditionalResult,
        aiEnhancements: {
          suggestions: aiResult.aiSuggestions || [],
          warnings: aiResult.aiWarnings || [],
          optimizations: aiResult.predictiveAlerts || []
        },
        overallScore: combinedScore,
        enhanced: true,
        aiValidation: aiResult
      };
    } catch (error) {
      console.error('Error in AI validation:', error);
      // Fallback a validación tradicional
      return {
        ...traditionalResult,
        aiEnhancements: null,
        overallScore: traditionalResult.completionPercentage,
        enhanced: false,
        aiError: error.message
      };
    }
  }, [formData, enableAI, validateTraditional, validateCompleteWithAI]);

  // Validación AI mejorada (si está habilitada)
  const aiValidation: AIValidationEnhanced | null = useMemo(() => {
    if (!enableAI) return null;
    
    // Simular validación AI básica para compatibilidad inmediata
    return {
      isValid: Object.values(stepValidations).every(Boolean),
      aiSuggestions: [],
      aiWarnings: [],
      predictiveAlerts: [],
      aiEnhancements: true,
      validationScore: totalProgress,
    };
  }, [enableAI, stepValidations, totalProgress]);

  const hasAIEnhancements = enableAI && aiValidation !== null;
  const validationMode = hasAIEnhancements ? 'ai-enhanced' : 'standard';
  const overallScore = hasAIEnhancements ? aiValidation.validationScore : totalProgress;

  return {
    stepValidations,
    totalProgress,
    aiValidation,
    hasAIEnhancements,
    validationMode,
    overallScore,
    validateComplete,
    validateTraditional,
    enableAI
  };
};
