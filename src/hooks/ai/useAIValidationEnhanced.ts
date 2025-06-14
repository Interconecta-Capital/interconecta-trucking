
import { useState, useCallback } from 'react';
import { geminiCore, AIValidationResult } from '@/services/ai/GeminiCoreService';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

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
  aiEnhancements: boolean;
  validationScore: number;
}

export function useAIValidationEnhanced() {
  const { context } = useAIContext();
  const [validationCache] = useState(new Map<string, AIValidationEnhanced>());

  const validateConfiguracion = useCallback(async (data: any): Promise<AIValidationResult> => {
    try {
      // Validar consistencia de RFCs
      const result = await geminiCore.validateData(
        { 
          rfcEmisor: data.rfcEmisor, 
          rfcReceptor: data.rfcReceptor,
          tipoOperacion: data.tipoOperacion 
        }, 
        'complete_form', 
        context
      );
      
      return result;
    } catch (error) {
      console.error('Error validating configuracion with AI:', error);
      return { isValid: true, confidence: 0.5, issues: [] };
    }
  }, [context]);

  const validateUbicaciones = useCallback(async (ubicaciones: any[]): Promise<AIValidationResult> => {
    try {
      if (ubicaciones.length < 2) {
        return { 
          isValid: false, 
          confidence: 1.0, 
          issues: [{ 
            field: 'ubicaciones', 
            severity: 'critical' as const, 
            message: 'Se requieren al menos origen y destino' 
          }] 
        };
      }

      // Validar cada ubicación y optimizar ruta
      const validationPromises = ubicaciones.map(ubicacion => 
        geminiCore.validateData(ubicacion, 'address', {
          ...context,
          addressComponent: ubicacion.tipoUbicacion
        })
      );

      const results = await Promise.all(validationPromises);
      
      // Combinar resultados
      const allIssues = results.flatMap(r => r.issues || []);
      const avgConfidence = results.reduce((acc, r) => acc + r.confidence, 0) / results.length;

      return {
        isValid: allIssues.filter(i => i.severity === 'critical').length === 0,
        confidence: avgConfidence,
        issues: allIssues
      };
    } catch (error) {
      console.error('Error validating ubicaciones with AI:', error);
      return { isValid: true, confidence: 0.5, issues: [] };
    }
  }, [context]);

  const validateMercancias = useCallback(async (mercancias: any[]): Promise<AIValidationResult> => {
    try {
      if (mercancias.length === 0) {
        return { 
          isValid: false, 
          confidence: 1.0, 
          issues: [{ 
            field: 'mercancias', 
            severity: 'critical' as const, 
            message: 'Se requiere al menos una mercancía' 
          }] 
        };
      }

      const validationPromises = mercancias.map(mercancia => 
        geminiCore.validateData(mercancia, 'mercancia', {
          ...context,
          productCode: mercancia.bienes_transp,
          unitCode: mercancia.clave_unidad,
          description: mercancia.descripcion
        })
      );

      const results = await Promise.all(validationPromises);
      
      const allIssues = results.flatMap(r => r.issues || []);
      const allAutoFixes = results.flatMap(r => r.autoFixes || []);
      const avgConfidence = results.reduce((acc, r) => acc + r.confidence, 0) / results.length;

      return {
        isValid: allIssues.filter(i => i.severity === 'critical').length === 0,
        confidence: avgConfidence,
        issues: allIssues,
        autoFixes: allAutoFixes
      };
    } catch (error) {
      console.error('Error validating mercancias with AI:', error);
      return { isValid: true, confidence: 0.5, issues: [] };
    }
  }, [context]);

  const validateAutotransporte = useCallback(async (autotransporte: any): Promise<AIValidationResult> => {
    try {
      if (!autotransporte) {
        return { 
          isValid: false, 
          confidence: 1.0, 
          issues: [{ 
            field: 'autotransporte', 
            severity: 'critical' as const, 
            message: 'Información de autotransporte requerida' 
          }] 
        };
      }

      return await geminiCore.validateData(autotransporte, 'vehicle', context);
    } catch (error) {
      console.error('Error validating autotransporte with AI:', error);
      return { isValid: true, confidence: 0.5, issues: [] };
    }
  }, [context]);

  const validateFiguras = useCallback(async (figuras: any[]): Promise<AIValidationResult> => {
    try {
      if (figuras.length === 0) {
        return { 
          isValid: false, 
          confidence: 1.0, 
          issues: [{ 
            field: 'figuras', 
            severity: 'critical' as const, 
            message: 'Se requiere al menos una figura de transporte' 
          }] 
        };
      }

      // Validar que haya al menos un operador
      const hasOperator = figuras.some(f => f.tipo_figura === '01');
      if (!hasOperator) {
        return {
          isValid: false,
          confidence: 0.9,
          issues: [{
            field: 'figuras',
            severity: 'high' as const,
            message: 'Se recomienda incluir al menos un operador (tipo 01)'
          }]
        };
      }

      return { isValid: true, confidence: 0.8, issues: [] };
    } catch (error) {
      console.error('Error validating figuras with AI:', error);
      return { isValid: true, confidence: 0.5, issues: [] };
    }
  }, [context]);

  const validateCompleteWithAI = useCallback(async (formData: CartaPorteData): Promise<AIValidationEnhanced> => {
    const cacheKey = JSON.stringify({
      rfcs: [formData.rfcEmisor, formData.rfcReceptor],
      ubicacionesCount: formData.ubicaciones?.length || 0,
      mercanciasCount: formData.mercancias?.length || 0,
      hasAutotransporte: !!formData.autotransporte,
      figurasCount: formData.figuras?.length || 0
    });

    // Check cache first
    const cached = validationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const [
        configResult,
        ubicacionesResult,
        mercanciasResult,
        autotransporteResult,
        figurasResult
      ] = await Promise.all([
        validateConfiguracion(formData),
        validateUbicaciones(formData.ubicaciones || []),
        validateMercancias(formData.mercancias || []),
        validateAutotransporte(formData.autotransporte),
        validateFiguras(formData.figuras || [])
      ]);

      // Consolidar resultados
      const allIssues = [
        ...(configResult.issues || []),
        ...(ubicacionesResult.issues || []),
        ...(mercanciasResult.issues || []),
        ...(autotransporteResult.issues || []),
        ...(figurasResult.issues || [])
      ];

      const allAutoFixes = [
        ...(configResult.autoFixes || []),
        ...(mercanciasResult.autoFixes || [])
      ];

      const criticalIssues = allIssues.filter(i => i.severity === 'critical');
      const isValid = criticalIssues.length === 0;

      // Calcular score de validación
      const baseScore = isValid ? 80 : 40;
      const bonusScore = Math.min(20, allAutoFixes.length * 5);
      const validationScore = Math.min(100, baseScore + bonusScore);

      // Convertir issues a formato UI
      const aiSuggestions = allIssues.map(issue => ({
        type: issue.severity === 'critical' ? 'error' as const : 
              issue.severity === 'high' ? 'warning' as const : 'suggestion' as const,
        title: `${issue.field.toUpperCase()}: ${issue.severity.toUpperCase()}`,
        message: issue.message,
        confidence: 0.8,
        autoFix: issue.suggestion ? () => console.log('Auto-fix:', issue.suggestion) : undefined
      }));

      const aiWarnings = allIssues.filter(i => i.severity !== 'low');

      const predictiveAlerts = allAutoFixes.map(fix => ({
        field: fix.field,
        prediction: `Sugerencia: ${fix.suggestedValue}`,
        confidence: fix.confidence,
        action: () => console.log('Apply fix:', fix)
      }));

      const result: AIValidationEnhanced = {
        isValid,
        aiSuggestions,
        aiWarnings,
        predictiveAlerts,
        aiEnhancements: true,
        validationScore
      };

      // Cache result
      validationCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error in comprehensive AI validation:', error);
      return {
        isValid: true,
        aiSuggestions: [],
        aiWarnings: [],
        predictiveAlerts: [],
        aiEnhancements: false,
        validationScore: 50
      };
    }
  }, [validateConfiguracion, validateUbicaciones, validateMercancias, validateAutotransporte, validateFiguras, validationCache]);

  return {
    validateCompleteWithAI,
    validateConfiguracion,
    validateUbicaciones,
    validateMercancias,
    validateAutotransporte,
    validateFiguras
  };
}
