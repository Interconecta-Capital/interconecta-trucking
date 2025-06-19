
import { useState, useEffect, useCallback } from 'react';
import { SATValidation31Enhanced, ValidationSAT31Result, CartaPorte31Data } from '@/services/validation/SATValidation31Enhanced';
import { useToast } from '@/hooks/use-toast';

export interface UseSATValidation31Options {
  autoValidate?: boolean;
  debounceMs?: number;
  enableCaching?: boolean;
}

export const useSATValidation31 = (options: UseSATValidation31Options = {}) => {
  const {
    autoValidate = true,
    debounceMs = 1000,
    enableCaching = true
  } = options;

  const [validationResult, setValidationResult] = useState<ValidationSAT31Result | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);
  const [validationCache] = useState(new Map<string, ValidationSAT31Result>());
  
  const { toast } = useToast();

  // Generar clave de cache basada en datos
  const generateCacheKey = useCallback((data: CartaPorte31Data): string => {
    return JSON.stringify({
      rfcs: [data.rfcEmisor, data.rfcReceptor],
      ubicacionesCount: data.ubicaciones?.length || 0,
      mercanciasCount: data.mercancias?.length || 0,
      hasAutotransporte: !!data.autotransporte,
      figurasCount: data.figuras?.length || 0,
      version31Fields: data.version31Fields
    });
  }, []);

  // Validar datos con cache
  const validateData = useCallback(async (data: CartaPorte31Data): Promise<ValidationSAT31Result> => {
    const cacheKey = generateCacheKey(data);
    
    // Verificar cache si está habilitado
    if (enableCaching && validationCache.has(cacheKey)) {
      const cached = validationCache.get(cacheKey)!;
      setValidationResult(cached);
      return cached;
    }

    setIsValidating(true);
    try {
      console.log('[SAT Validation 3.1] Iniciando validación completa');
      
      const result = await SATValidation31Enhanced.validateCompleteCartaPorte31(data);
      
      // Guardar en cache
      if (enableCaching) {
        validationCache.set(cacheKey, result);
      }
      
      setValidationResult(result);
      setLastValidation(new Date());
      
      // Mostrar notificaciones según resultado
      if (result.criticalIssues.length > 0) {
        toast({
          title: "Errores críticos encontrados",
          description: `${result.criticalIssues.length} problemas críticos requieren atención inmediata`,
          variant: "destructive",
        });
      } else if (result.errors.length > 0) {
        toast({
          title: "Errores de validación",
          description: `${result.errors.length} errores encontrados`,
          variant: "destructive",
        });
      } else if (result.warnings.length > 0) {
        toast({
          title: "Validación con advertencias",
          description: `${result.warnings.length} advertencias - Score: ${result.complianceScore}%`,
        });
      } else {
        toast({
          title: "Validación exitosa",
          description: `Cumplimiento SAT 3.1: ${result.complianceScore}%`,
        });
      }
      
      console.log('[SAT Validation 3.1] Validación completada:', {
        isValid: result.isValid,
        score: result.complianceScore,
        errorsCount: result.errors.length,
        warningsCount: result.warnings.length
      });
      
      return result;
    } catch (error) {
      console.error('[SAT Validation 3.1] Error en validación:', error);
      
      const errorResult: ValidationSAT31Result = {
        isValid: false,
        message: 'Error interno de validación',
        errors: ['Error interno del sistema de validación'],
        warnings: [],
        recommendations: [],
        complianceScore: 0,
        criticalIssues: ['Error crítico en validación'],
        version31Specific: []
      };
      
      setValidationResult(errorResult);
      
      toast({
        title: "Error en validación",
        description: "Error interno del sistema de validación",
        variant: "destructive",
      });
      
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [generateCacheKey, enableCaching, validationCache, toast]);

  // Validar sección específica
  const validateSection = useCallback(async (
    sectionName: 'ubicaciones' | 'mercancias' | 'autotransporte' | 'figuras',
    sectionData: any,
    fullData: CartaPorte31Data
  ): Promise<Partial<ValidationSAT31Result>> => {
    try {
      console.log(`[SAT Validation 3.1] Validando sección: ${sectionName}`);
      
      // Para validaciones de sección, usamos la validación completa pero filtramos resultados
      const fullResult = await SATValidation31Enhanced.validateCompleteCartaPorte31(fullData);
      
      // Filtrar errores y warnings por sección
      const sectionPrefix = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
      const sectionErrors = fullResult.errors.filter(error => 
        error.toLowerCase().includes(sectionName) || error.includes(sectionPrefix)
      );
      const sectionWarnings = fullResult.warnings.filter(warning => 
        warning.toLowerCase().includes(sectionName) || warning.includes(sectionPrefix)
      );
      
      return {
        errors: sectionErrors,
        warnings: sectionWarnings,
        isValid: sectionErrors.length === 0
      };
    } catch (error) {
      console.error(`[SAT Validation 3.1] Error validando sección ${sectionName}:`, error);
      return {
        errors: [`Error validando ${sectionName}`],
        warnings: [],
        isValid: false
      };
    }
  }, []);

  // Limpiar cache
  const clearCache = useCallback(() => {
    validationCache.clear();
    console.log('[SAT Validation 3.1] Cache limpiado');
  }, [validationCache]);

  // Obtener estadísticas de validación
  const getValidationStats = useCallback(() => {
    if (!validationResult) return null;
    
    return {
      totalIssues: validationResult.errors.length + validationResult.warnings.length,
      criticalCount: validationResult.criticalIssues.length,
      errorsCount: validationResult.errors.length,
      warningsCount: validationResult.warnings.length,
      recommendationsCount: validationResult.recommendations.length,
      version31Count: validationResult.version31Specific.length,
      complianceScore: validationResult.complianceScore,
      isValid: validationResult.isValid,
      lastValidation
    };
  }, [validationResult, lastValidation]);

  return {
    // Estado
    validationResult,
    isValidating,
    lastValidation,
    
    // Funciones
    validateData,
    validateSection,
    clearCache,
    getValidationStats,
    
    // Configuración
    autoValidate,
    debounceMs
  };
};
