
import { useState, useCallback, useEffect } from 'react';
import { geminiValidationService, ValidationResult } from '@/services/ai/GeminiValidationService';
import { debounce } from 'lodash';

export interface AIValidationOptions {
  enabled?: boolean;
  debounceMs?: number;
  autoValidate?: boolean;
  validationTypes?: string[];
}

export function useAIValidation({
  enabled = true,
  debounceMs = 1000,
  autoValidate = true,
  validationTypes = ['formato', 'contenido', 'coherencia']
}: AIValidationOptions = {}) {
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [hasWarnings, setHasWarnings] = useState(false);
  const [hasCriticalErrors, setHasCriticalErrors] = useState(false);

  const validateField = useCallback(async (field: string, value: any, tipo: string) => {
    if (!enabled || !value) return;

    setIsValidating(prev => ({ ...prev, [field]: true }));

    try {
      let result: ValidationResult;

      switch (tipo) {
        case 'direccion':
          result = await geminiValidationService.validarDireccion(value);
          break;
        case 'mercancia':
          result = await geminiValidationService.validarMercancia(value);
          break;
        default:
          result = await geminiValidationService.detectarAnomalias(value, tipo);
      }

      setValidationResults(prev => ({
        ...prev,
        [field]: result
      }));

    } catch (error) {
      console.error(`[useAIValidation] Error validating ${field}:`, error);
      setValidationResults(prev => ({
        ...prev,
        [field]: {
          isValid: false,
          confidence: 0,
          warnings: [{
            field,
            message: 'Error en validación automática',
            severity: 'medium' as const,
            type: 'contenido' as const
          }],
          suggestions: []
        }
      }));
    } finally {
      setIsValidating(prev => ({ ...prev, [field]: false }));
    }
  }, [enabled]);

  const debouncedValidate = useCallback(
    debounce(validateField, debounceMs),
    [validateField, debounceMs]
  );

  const validateFormSection = useCallback(async (section: string, data: any) => {
    if (!enabled) return;

    try {
      const result = await geminiValidationService.validarCoherenciaGeneral(data);
      setValidationResults(prev => ({
        ...prev,
        [section]: result
      }));
    } catch (error) {
      console.error(`[useAIValidation] Error validating section ${section}:`, error);
    }
  }, [enabled]);

  const getFieldValidation = useCallback((field: string): ValidationResult | null => {
    return validationResults[field] || null;
  }, [validationResults]);

  const getFieldWarnings = useCallback((field: string) => {
    const validation = validationResults[field];
    return validation?.warnings || [];
  }, [validationResults]);

  const getFieldSuggestions = useCallback((field: string) => {
    const validation = validationResults[field];
    return validation?.suggestions || [];
  }, [validationResults]);

  const isFieldValid = useCallback((field: string): boolean => {
    const validation = validationResults[field];
    if (!validation) return true; // No validation means assumed valid
    
    return validation.isValid && !(validation.warnings && validation.warnings.some(w => w.severity === 'critical'));
  }, [validationResults]);

  const clearValidation = useCallback((field?: string) => {
    if (field) {
      setValidationResults(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      setIsValidating(prev => ({ ...prev, [field]: false }));
    } else {
      setValidationResults({});
      setIsValidating({});
    }
  }, []);

  const applyAutoFix = useCallback((field: string, autoFix: any) => {
    console.log(`[useAIValidation] Applying auto-fix for ${field}:`, autoFix);
    // El componente padre debe manejar la aplicación del fix
    return autoFix.suggestedValue;
  }, []);

  // Calcular estados globales con null checks
  useEffect(() => {
    const allResults = Object.values(validationResults);
    
    const warnings = allResults.some(r => r && r.warnings && r.warnings.length > 0);
    const critical = allResults.some(r => 
      r && (
        (r.warnings && r.warnings.some(w => w.severity === 'critical')) || 
        !r.isValid
      )
    );

    setHasWarnings(warnings);
    setHasCriticalErrors(critical);
  }, [validationResults]);

  // Auto-validate cuando cambia el valor
  const autoValidateField = useCallback((field: string, value: any, tipo: string) => {
    if (autoValidate && enabled) {
      debouncedValidate(field, value, tipo);
    }
  }, [autoValidate, enabled, debouncedValidate]);

  return {
    // States
    validationResults,
    isValidating,
    hasWarnings,
    hasCriticalErrors,
    
    // Actions
    validateField,
    validateFormSection,
    autoValidateField,
    clearValidation,
    applyAutoFix,
    
    // Getters
    getFieldValidation,
    getFieldWarnings,
    getFieldSuggestions,
    isFieldValid
  };
}
