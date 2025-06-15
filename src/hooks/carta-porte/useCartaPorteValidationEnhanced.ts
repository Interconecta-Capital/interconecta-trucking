
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
  
  // Mock AI validation hook - replace with real implementation when available
  const validateCompleteWithAI = useCallback(async (data: CartaPorteData) => {
    // Mock implementation
    return {
      isValid: true,
      aiSuggestions: [],
      aiWarnings: [],
      predictiveAlerts: [],
      validationScore: 85
    };
  }, []);

  // Validaciones por step usando validación tradicional
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

  // Progreso total basado en validación tradicional
  const totalProgress = useMemo(() => {
    const validSteps = Object.values(stepValidations).filter(Boolean).length;
    return Math.round((validSteps / Object.keys(stepValidations).length) * 100);
  }, [stepValidations]);

  // Validación completa combinada (tradicional + AI)
  const validateComplete = useCallback(async (formDataInput?: CartaPorteData) => {
    const dataToValidate = formDataInput || formData;
    
    // Validación tradicional (base)
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
      // Validación AI si está habilitada
      const aiResult = await validateCompleteWithAI(dataToValidate);
      
      // Combinar resultados (70% tradicional, 30% AI)
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
      // Fallback a validación tradicional
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
