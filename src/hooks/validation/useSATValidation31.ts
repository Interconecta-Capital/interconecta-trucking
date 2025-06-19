
import { useState, useEffect, useCallback } from 'react';
import { SATValidation31Enhanced, ValidationSAT31Result, CartaPorte31Data } from '@/services/validation/SATValidation31Enhanced';
import { useToast } from '@/hooks/use-toast';
import { CartaPorteData } from '@/types/cartaPorte';

export interface UseSATValidation31Options {
  autoValidate?: boolean;
  debounceMs?: number;
  enableCaching?: boolean;
}

// Función para adaptar CartaPorteData a CartaPorte31Data
const adaptCartaPorteToValidation = (data: CartaPorteData): CartaPorte31Data => {
  return {
    rfcEmisor: data.rfcEmisor,
    rfcReceptor: data.rfcReceptor,
    cartaPorteVersion: data.cartaPorteVersion,
    
    // Adaptar ubicaciones con nuevos campos
    ubicaciones: data.ubicaciones?.map(ubicacion => ({
      ...ubicacion,
      // Asegurar que los campos nuevos estén incluidos
      coordenadas: ubicacion.coordenadas,
      tipo_estacion: ubicacion.tipo_estacion,
      numero_estacion: ubicacion.numero_estacion,
      kilometro: ubicacion.kilometro,
    })) || [],
    
    // Adaptar mercancías con campos de v3.1
    mercancias: data.mercancias?.map(mercancia => ({
      ...mercancia,
      // Campos nuevos de la migración
      tipo_embalaje: mercancia.tipo_embalaje,
      dimensiones: mercancia.dimensiones,
      numero_piezas: mercancia.numero_piezas,
      regimen_aduanero: mercancia.regimen_aduanero,
      // Validar fracción arancelaria para v3.1
      fraccion_arancelaria: mercancia.fraccion_arancelaria || (data.cartaPorteVersion === '3.1' ? '' : undefined),
    })) || [],
    
    // Adaptar autotransporte con campos nuevos
    autotransporte: data.autotransporte ? {
      ...data.autotransporte,
      // Campos obligatorios en v3.1
      peso_bruto_vehicular: data.autotransporte.peso_bruto_vehicular || 0,
      tipo_carroceria: data.autotransporte.tipo_carroceria,
      carga_maxima: data.autotransporte.carga_maxima,
      tarjeta_circulacion: data.autotransporte.tarjeta_circulacion,
      vigencia_tarjeta_circulacion: data.autotransporte.vigencia_tarjeta_circulacion,
      // Incluir remolques nuevos
      remolques: data.autotransporte.remolques || [],
    } : undefined,
    
    figuras: data.figuras || [],
    
    // Campos específicos de versión 3.1
    version31Fields: data.version31Fields || (data.cartaPorteVersion === '3.1' ? {
      transporteEspecializado: false,
      tipoCarroceria: data.autotransporte?.tipo_carroceria,
      registroISTMO: data.registroIstmo || false,
      remolquesCCP: data.autotransporte?.remolques || [],
    } : undefined),
    
    // Regímenes aduaneros según versión
    regimenAduanero: data.regimenAduanero,
    regimenesAduaneros: data.regimenesAduaneros,
  };
};

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

  // Generar clave de cache incluyendo nuevos campos
  const generateCacheKey = useCallback((data: CartaPorte31Data): string => {
    return JSON.stringify({
      rfcs: [data.rfcEmisor, data.rfcReceptor],
      version: data.cartaPorteVersion,
      ubicacionesCount: data.ubicaciones?.length || 0,
      mercanciasCount: data.mercancias?.length || 0,
      hasAutotransporte: !!data.autotransporte,
      pesoBrutoVehicular: data.autotransporte?.peso_bruto_vehicular,
      figurasCount: data.figuras?.length || 0,
      version31Fields: data.version31Fields,
      regimenesCount: data.regimenesAduaneros?.length || 0,
    });
  }, []);

  // Validar datos con adaptación automática
  const validateData = useCallback(async (data: CartaPorteData): Promise<ValidationSAT31Result> => {
    const adaptedData = adaptCartaPorteToValidation(data);
    const cacheKey = generateCacheKey(adaptedData);
    
    // Verificar cache si está habilitado
    if (enableCaching && validationCache.has(cacheKey)) {
      const cached = validationCache.get(cacheKey)!;
      setValidationResult(cached);
      return cached;
    }

    setIsValidating(true);
    try {
      console.log('[SAT Validation 3.1] Iniciando validación con datos adaptados');
      
      const result = await SATValidation31Enhanced.validateCompleteCartaPorte31(adaptedData);
      
      // Agregar validaciones específicas para nuevos campos
      const additionalValidations = validateNewFields(data);
      if (additionalValidations.length > 0) {
        result.errors = [...result.errors, ...additionalValidations];
        result.isValid = result.isValid && additionalValidations.length === 0;
      }
      
      // Guardar en cache
      if (enableCaching) {
        validationCache.set(cacheKey, result);
      }
      
      setValidationResult(result);
      setLastValidation(new Date());
      
      // Mostrar notificaciones mejoradas
      if (result.criticalIssues.length > 0) {
        toast({
          title: "❌ Errores críticos detectados",
          description: `${result.criticalIssues.length} problemas críticos impiden el timbrado`,
          variant: "destructive",
        });
      } else if (result.errors.length > 0) {
        toast({
          title: "⚠️ Errores de validación",
          description: `${result.errors.length} errores encontrados - Score: ${result.complianceScore}%`,
          variant: "destructive",
        });
      } else if (result.warnings.length > 0) {
        toast({
          title: "✅ Validación con advertencias",
          description: `${result.warnings.length} advertencias - Score: ${result.complianceScore}%`,
        });
      } else {
        toast({
          title: "✅ Validación exitosa",
          description: `Cumplimiento SAT ${data.cartaPorteVersion}: ${result.complianceScore}%`,
        });
      }
      
      console.log('[SAT Validation 3.1] Validación completada:', {
        isValid: result.isValid,
        score: result.complianceScore,
        errorsCount: result.errors.length,
        warningsCount: result.warnings.length,
        newFieldsValidated: true,
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
        title: "💥 Error en validación",
        description: "Error interno del sistema de validación",
        variant: "destructive",
      });
      
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [generateCacheKey, enableCaching, validationCache, toast]);

  // Validaciones específicas para campos nuevos
  const validateNewFields = (data: CartaPorteData): string[] => {
    const errors: string[] = [];
    
    // Validaciones para v3.1
    if (data.cartaPorteVersion === '3.1') {
      // Peso bruto vehicular obligatorio
      if (!data.autotransporte?.peso_bruto_vehicular || data.autotransporte.peso_bruto_vehicular <= 0) {
        errors.push('Peso bruto vehicular es obligatorio en versión 3.1');
      }
      
      // Fracción arancelaria obligatoria en mercancías
      const mercanciasSinFraccion = data.mercancias?.filter(m => !m.fraccion_arancelaria);
      if (mercanciasSinFraccion && mercanciasSinFraccion.length > 0) {
        errors.push(`${mercanciasSinFraccion.length} mercancías sin fracción arancelaria (obligatoria en v3.1)`);
      }
      
      // Validar regímenes aduaneros (debe ser array en v3.1)
      if (data.regimenAduanero && !data.regimenesAduaneros) {
        errors.push('En v3.1 se requiere usar regímenes aduaneros como array');
      }
    }
    
    // Validaciones para coordenadas si están presentes
    data.ubicaciones?.forEach((ubicacion, index) => {
      if (ubicacion.coordenadas) {
        const { latitud, longitud } = ubicacion.coordenadas;
        if (latitud < -90 || latitud > 90) {
          errors.push(`Ubicación ${index + 1}: Latitud inválida (${latitud})`);
        }
        if (longitud < -180 || longitud > 180) {
          errors.push(`Ubicación ${index + 1}: Longitud inválida (${longitud})`);
        }
      }
    });
    
    return errors;
  };

  // Validar sección específica con adaptación
  const validateSection = useCallback(async (
    sectionName: 'ubicaciones' | 'mercancias' | 'autotransporte' | 'figuras',
    sectionData: any,
    fullData: CartaPorteData
  ): Promise<Partial<ValidationSAT31Result>> => {
    try {
      console.log(`[SAT Validation 3.1] Validando sección: ${sectionName}`);
      
      const adaptedData = adaptCartaPorteToValidation(fullData);
      const fullResult = await SATValidation31Enhanced.validateCompleteCartaPorte31(adaptedData);
      
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
    clearCache: useCallback(() => {
      validationCache.clear();
      console.log('[SAT Validation 3.1] Cache limpiado');
    }, [validationCache]),
    
    getValidationStats: useCallback(() => {
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
    }, [validationResult, lastValidation]),
    
    // Configuración
    autoValidate,
    debounceMs
  };
};
