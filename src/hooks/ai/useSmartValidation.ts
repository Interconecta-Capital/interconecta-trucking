
import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { CartaPorteData } from '@/types/cartaPorte';
import { SmartValidationService, SmartValidationResult, ValidationIssue } from '@/services/ai/SmartValidationService';

interface UseSmartValidationOptions {
  autoValidate?: boolean;
  validationDelay?: number;
  enableRealTimeAlerts?: boolean;
}

export const useSmartValidation = ({
  autoValidate = true,
  validationDelay = 2000,
  enableRealTimeAlerts = true
}: UseSmartValidationOptions = {}) => {
  const [validationResult, setValidationResult] = useState<SmartValidationResult | null>(null);
  const [realTimeAlerts, setRealTimeAlerts] = useState<ValidationIssue[]>([]);
  const [validationHistory, setValidationHistory] = useState<SmartValidationResult[]>([]);
  const { toast } = useToast();

  // Mutación para validación manual
  const validateMutation = useMutation({
    mutationFn: async (data: CartaPorteData) => {
      console.log('🔍 [useSmartValidation] Iniciando validación inteligente...');
      return await SmartValidationService.validateCartaPorteInteligente(data);
    },
    onSuccess: (result) => {
      setValidationResult(result);
      
      // Actualizar historial
      setValidationHistory(prev => [result, ...prev.slice(0, 9)]);
      
      // Procesar alertas en tiempo real
      if (enableRealTimeAlerts && result.realTimeAlerts.length > 0) {
        setRealTimeAlerts(result.realTimeAlerts);
        
        const criticalAlerts = result.realTimeAlerts.filter(a => a.severity === 'critical');
        if (criticalAlerts.length > 0) {
          toast({
            title: "⚠️ Problemas Críticos Detectados",
            description: `${criticalAlerts.length} problema(s) crítico(s) requieren atención inmediata`,
            variant: "destructive",
          });
        }
      }
      
      // Toast informativo sobre el resultado
      const scoreColor = result.overallScore >= 80 ? 'success' : 
                        result.overallScore >= 60 ? 'warning' : 'error';
      
      if (result.overallScore >= 90) {
        toast({
          title: "✅ Validación Excelente",
          description: `Score: ${result.overallScore}% - Documento listo para timbrar`,
        });
      } else if (result.overallScore >= 70) {
        toast({
          title: "⚠️ Validación con Advertencias",
          description: `Score: ${result.overallScore}% - Revise las recomendaciones`,
        });
      } else {
        toast({
          title: "❌ Validación con Errores",
          description: `Score: ${result.overallScore}% - Corrija los problemas críticos`,
          variant: "destructive",
        });
      }

      console.log('✅ Validación completada:', {
        score: result.overallScore,
        isValid: result.isValid,
        issues: result.issues.length,
        riskLevel: result.aiInsights.riskLevel
      });
    },
    onError: (error: Error) => {
      console.error('❌ Error en validación inteligente:', error);
      toast({
        title: "Error en Validación",
        description: error.message || "No se pudo completar la validación",
        variant: "destructive",
      });
    },
  });

  // Función para validar manualmente
  const validateData = useCallback((data: CartaPorteData) => {
    validateMutation.mutate(data);
  }, [validateMutation]);

  // Función para validación automática con debounce
  const [autoValidationTimeout, setAutoValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const scheduleAutoValidation = useCallback((data: CartaPorteData) => {
    if (!autoValidate) return;

    if (autoValidationTimeout) {
      clearTimeout(autoValidationTimeout);
    }

    const timeout = setTimeout(() => {
      console.log('🔄 Auto-validación programada ejecutándose...');
      validateMutation.mutate(data);
    }, validationDelay);

    setAutoValidationTimeout(timeout);
  }, [autoValidate, validationDelay, validateMutation, autoValidationTimeout]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (autoValidationTimeout) {
        clearTimeout(autoValidationTimeout);
      }
    };
  }, [autoValidationTimeout]);

  // Función para obtener issues por sección
  const getIssuesBySection = useCallback((section: string) => {
    if (!validationResult) return [];
    return validationResult.issues.filter(issue => issue.section === section);
  }, [validationResult]);

  // Función para obtener score de sección
  const getSectionScore = useCallback((section: keyof SmartValidationResult['sectionsStatus']) => {
    if (!validationResult) return 0;
    return validationResult.sectionsStatus[section]?.score || 0;
  }, [validationResult]);

  // Función para verificar si una sección es válida
  const isSectionValid = useCallback((section: keyof SmartValidationResult['sectionsStatus']) => {
    if (!validationResult) return false;
    return validationResult.sectionsStatus[section]?.valid || false;
  }, [validationResult]);

  // Función para limpiar alertas
  const clearAlerts = useCallback(() => {
    setRealTimeAlerts([]);
  }, []);

  // Función para aplicar auto-fix
  const applyAutoFix = useCallback((issueId: string) => {
    const issue = validationResult?.issues.find(i => i.id === issueId);
    if (issue && issue.autoFix) {
      try {
        issue.autoFix();
        toast({
          title: "🔧 Auto-corrección Aplicada",
          description: `Se corrigió: ${issue.message}`,
        });
      } catch (error) {
        console.error('Error aplicando auto-fix:', error);
        toast({
          title: "Error en Auto-corrección",
          description: "No se pudo aplicar la corrección automática",
          variant: "destructive",
        });
      }
    }
  }, [validationResult, toast]);

  // Función para obtener progreso de completitud
  const getCompletionProgress = useCallback(() => {
    if (!validationResult) return 0;
    
    const totalSections = Object.keys(validationResult.sectionsStatus).length;
    const validSections = Object.values(validationResult.sectionsStatus).filter(s => s.valid).length;
    
    return Math.round((validSections / totalSections) * 100);
  }, [validationResult]);

  // Estado de carga y helpers
  const isValidating = validateMutation.isPending;
  const hasValidation = !!validationResult;
  const canTimbrar = validationResult?.isValid && validationResult.overallScore >= 80;

  return {
    // Estado principal
    validationResult,
    isValidating,
    hasValidation,
    canTimbrar,
    
    // Alertas y problemas
    realTimeAlerts,
    clearAlerts,
    
    // Funciones de validación
    validateData,
    scheduleAutoValidation,
    
    // Helpers por sección
    getIssuesBySection,
    getSectionScore,
    isSectionValid,
    
    // Utilidades
    applyAutoFix,
    getCompletionProgress,
    
    // Historial
    validationHistory,
    
    // Configuración
    autoValidate,
    enableRealTimeAlerts,
  };
};
