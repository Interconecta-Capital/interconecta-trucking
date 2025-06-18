import { useMemo, useCallback } from 'react';
import { useCartaPorteValidation } from './useCartaPorteValidation';
import { useAIValidationEnhanced } from '../ai/useAIValidationEnhanced';
import { CartaPorteData } from '@/types/cartaPorte';

interface UseCartaPorteValidationEnhancedOptions {
  formData: CartaPorteData;
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
  const { validateComplete: validateTraditional, getValidationSummary } = useCartaPorteValidation();
  
  const validateCompleteWithAI = useCallback(async (data: CartaPorteData) => {
    return {
      isValid: true,
      aiSuggestions: [],
      aiWarnings: [],
      predictiveAlerts: [],
      validationScore: 85
    };
  }, []);

  const stepValidations: StepValidation = useMemo(() => {
    const summary = getValidationSummary(formData);
    
    return {
      configuracion: summary.sectionStatus.configuracion === 'complete',
      ubicaciones: summary.sectionStatus.ubicaciones === 'complete',
      mercancias: summary.sectionStatus.mercancias === 'complete',
      autotransporte: summary.sectionStatus.autotransporte === 'complete',
      figuras: summary.sectionStatus.figuras === 'complete',
    };
  }, [formData, getValidationSummary]);

  const totalProgress = useMemo(() => {
    const validSteps = Object.values(stepValidations).filter(Boolean).length;
    return Math.round((validSteps / Object.keys(stepValidations).length) * 100);
  }, [stepValidations]);

  const validateComplete = useCallback(async (formDataInput?: CartaPorteData) => {
    const dataToValidate = formDataInput || formData;
    
    const traditionalResult = validateTraditional(dataToValidate);
    const summary = getValidationSummary(dataToValidate);
    
    if (!enableAI) {
      return {
        ...traditionalResult,
        completionPercentage: summary.completionPercentage,
        aiEnhancements: null,
        overallScore: summary.completionPercentage,
        enhanced: false
      };
    }

    try {
      const aiResult = await validateCompleteWithAI(dataToValidate);
      
      const combinedScore = Math.round(
        (summary.completionPercentage * 0.7) +
        (aiResult.validationScore * 0.3)
      );

      return {
        ...traditionalResult,
        completionPercentage: summary.completionPercentage,
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
      return {
        ...traditionalResult,
        completionPercentage: summary.completionPercentage,
        aiEnhancements: null,
        overallScore: summary.completionPercentage,
        enhanced: false,
        aiError: (error as Error).message
      };
    }
  }, [formData, enableAI, validateTraditional, validateCompleteWithAI, getValidationSummary]);

  const aiValidation: AIValidationEnhanced | null = useMemo(() => {
    if (!enableAI) return null;
    
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
