import { useState, useCallback } from 'react';
import { geminiCore, AIValidationResult } from '@/services/ai/GeminiCoreService';
import { CartaPorteFormData } from '../carta-porte/useCartaPorteMappers';

export interface AIValidationEnhanced {
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
  validationScore: number;
}

export const useAIValidationEnhanced = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidationResult, setLastValidationResult] = useState<AIValidationEnhanced | null>(null);

  const validateCompleteWithAI = useCallback(async (formData: CartaPorteFormData): Promise<AIValidationEnhanced> => {
    setIsValidating(true);
    
    try {
      // Validación de coherencia general
      const coherenciaResult = await geminiCore.validateData(
        formData,
        'complete_form',
        {
          userId: 'current_user',
          businessContext: {
            industry: 'transporte',
            region: 'mexico',
            vehicleTypes: formData.autotransporte ? [formData.autotransporte.config_vehicular] : [],
            commonRoutes: formData.ubicaciones?.map(u => u.domicilio.municipio).filter(Boolean) || []
          }
        }
      );

      // Validaciones específicas por sección
      const [ubicacionesValidation, mercanciasValidation, autotransporteValidation] = await Promise.all([
        validateUbicaciones(formData.ubicaciones || []),
        validateMercancias(formData.mercancias || []),
        validateAutotransporte(formData.autotransporte)
      ]);

      // Combinar todos los resultados
      const combinedResult: AIValidationEnhanced = {
        isValid: coherenciaResult.isValid && ubicacionesValidation.isValid && mercanciasValidation.isValid && autotransporteValidation.isValid,
        aiSuggestions: [
          ...mapIssuestoSuggestions(coherenciaResult.issues),
          ...mapIssuestoSuggestions(ubicacionesValidation.issues),
          ...mapIssuestoSuggestions(mercanciasValidation.issues),
          ...mapIssuestoSuggestions(autotransporteValidation.issues)
        ],
        aiWarnings: [
          ...mapIssuesToWarnings(coherenciaResult.issues),
          ...mapIssuesToWarnings(ubicacionesValidation.issues),
          ...mapIssuesToWarnings(mercanciasValidation.issues),
          ...mapIssuesToWarnings(autotransporteValidation.issues)
        ],
        predictiveAlerts: await generatePredictiveAlerts(formData),
        validationScore: calculateValidationScore([coherenciaResult, ubicacionesValidation, mercanciasValidation, autotransporteValidation])
      };

      setLastValidationResult(combinedResult);
      return combinedResult;
    } catch (error) {
      console.error('[AIValidationEnhanced] Error:', error);
      
      // Fallback result
      const fallbackResult: AIValidationEnhanced = {
        isValid: true,
        aiSuggestions: [],
        aiWarnings: [],
        predictiveAlerts: [],
        validationScore: 75
      };
      
      setLastValidationResult(fallbackResult);
      return fallbackResult;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateUbicaciones = async (ubicaciones: any[]): Promise<AIValidationResult> => {
    try {
      return await geminiCore.validateData(ubicaciones, 'address', {
        category: 'ubicaciones_carta_porte',
        businessContext: { region: 'mexico' }
      });
    } catch (error) {
      return { isValid: true, confidence: 0.5, issues: [] };
    }
  };

  const validateMercancias = async (mercancias: any[]): Promise<AIValidationResult> => {
    try {
      return await geminiCore.validateData(mercancias, 'mercancia', {
        category: 'mercancias_carta_porte',
        businessContext: { industry: 'transporte' }
      });
    } catch (error) {
      return { isValid: true, confidence: 0.5, issues: [] };
    }
  };

  const validateAutotransporte = async (autotransporte: any): Promise<AIValidationResult> => {
    try {
      return await geminiCore.validateData(autotransporte, 'vehicle', {
        category: 'autotransporte_carta_porte',
        businessContext: { industry: 'transporte', region: 'mexico' }
      });
    } catch (error) {
      return { isValid: true, confidence: 0.5, issues: [] };
    }
  };

  const mapIssuestoSuggestions = (issues: any[]): AIValidationEnhanced['aiSuggestions'] => {
    return issues.map(issue => ({
      type: issue.severity === 'critical' ? 'error' : issue.severity === 'high' ? 'warning' : 'suggestion',
      title: `${issue.field}: ${issue.severity}`,
      message: issue.message,
      confidence: 0.8
    }));
  };

  const mapIssuesToWarnings = (issues: any[]): AIValidationEnhanced['aiWarnings'] => {
    return issues.map(issue => ({
      field: issue.field,
      message: issue.message,
      severity: issue.severity
    }));
  };

  const generatePredictiveAlerts = async (formData: CartaPorteFormData): Promise<AIValidationEnhanced['predictiveAlerts']> => {
    try {
      // Analizar patrones y generar alertas predictivas
      const alerts: AIValidationEnhanced['predictiveAlerts'] = [];

      // Ejemplo: Predecir problemas de peso vs configuración vehicular
      if (formData.mercancias && formData.autotransporte) {
        const pesoTotal = formData.mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
        const configVehicular = formData.autotransporte.config_vehicular;

        if (pesoTotal > 10000 && configVehicular === 'VL') {
          alerts.push({
            field: 'autotransporte.config_vehicular',
            prediction: 'El peso total de mercancías puede exceder la capacidad de un vehículo ligero',
            confidence: 0.85
          });
        }
      }

      // Ejemplo: Validar coherencia de ubicaciones
      if (formData.ubicaciones && formData.ubicaciones.length >= 2) {
        const estados = formData.ubicaciones.map(u => u.domicilio.estado).filter(Boolean);
        const estadosUnicos = new Set(estados);

        if (estadosUnicos.size > 3) {
          alerts.push({
            field: 'ubicaciones',
            prediction: 'Ruta con muchos estados diferentes puede requerir permisos especiales',
            confidence: 0.75
          });
        }
      }

      return alerts;
    } catch (error) {
      console.error('[PredictiveAlerts] Error:', error);
      return [];
    }
  };

  const calculateValidationScore = (results: AIValidationResult[]): number => {
    const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0);
    const averageConfidence = results.reduce((sum, result) => sum + result.confidence, 0) / results.length;
    
    // Score basado en cantidad de issues y confianza promedio
    const issuesPenalty = Math.min(totalIssues * 5, 30); // Máximo 30 puntos de penalización
    const baseScore = averageConfidence * 100;
    
    return Math.max(0, Math.min(100, baseScore - issuesPenalty));
  };

  return {
    validateCompleteWithAI,
    isValidating,
    lastValidationResult
  };
};
