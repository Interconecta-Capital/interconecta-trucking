
import { useMemo, useCallback } from 'react';
import { useCartaPorteValidation } from './useCartaPorteValidation';
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
  const { validateComplete, validationResult } = useCartaPorteValidation();

  // Validaciones por step
  const stepValidations: StepValidation = useMemo(() => {
    const result = validateComplete(formData);
    
    return {
      configuracion: !result.errors.configuracion || result.errors.configuracion.length === 0,
      ubicaciones: !result.errors.ubicaciones || result.errors.ubicaciones.length === 0,
      mercancias: !result.errors.mercancias || result.errors.mercancias.length === 0,
      autotransporte: !result.errors.autotransporte || result.errors.autotransporte.length === 0,
      figuras: !result.errors.figuras || result.errors.figuras.length === 0,
    };
  }, [formData, validateComplete]);

  // Progreso total
  const totalProgress = useMemo(() => {
    const validSteps = Object.values(stepValidations).filter(Boolean).length;
    return Math.round((validSteps / Object.keys(stepValidations).length) * 100);
  }, [stepValidations]);

  // Validación IA mejorada
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
    validationResult,
  };
};
