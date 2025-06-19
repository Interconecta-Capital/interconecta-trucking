
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteData, MercanciaCompleta, UbicacionCompleta, AutotransporteCompleto, FiguraCompleta } from '@/types/cartaPorte';

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'suggestion' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  field: string;
  section: 'configuracion' | 'ubicaciones' | 'mercancias' | 'autotransporte' | 'figuras' | 'general';
  message: string;
  suggestion?: string;
  autoFix?: () => void;
  confidence: number;
  satRule?: string;
  regulatoryContext?: string;
}

export interface SmartValidationResult {
  isValid: boolean;
  overallScore: number;
  issues: ValidationIssue[];
  sectionsStatus: {
    configuracion: { valid: boolean; score: number; issues: ValidationIssue[] };
    ubicaciones: { valid: boolean; score: number; issues: ValidationIssue[] };
    mercancias: { valid: boolean; score: number; issues: ValidationIssue[] };
    autotransporte: { valid: boolean; score: number; issues: ValidationIssue[] };
    figuras: { valid: boolean; score: number; issues: ValidationIssue[] };
  };
  recommendations: string[];
  aiInsights: {
    riskLevel: 'low' | 'medium' | 'high';
    compliancePrediction: number;
    optimizationSuggestions: string[];
    timbradoProbability: number;
  };
  realTimeAlerts: ValidationIssue[];
}

export class SmartValidationService {
  private static validationCache = new Map<string, SmartValidationResult>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static async validateCartaPorteInteligente(data: CartaPorteData): Promise<SmartValidationResult> {
    console.log('🧠 [SmartValidation] Iniciando validación inteligente de Carta Porte...');

    const validationHash = this.generateValidationHash(data);
    const cached = this.getCachedValidation(validationHash);
    if (cached) {
      console.log('✅ Validación obtenida del cache');
      return cached;
    }

    try {
      // Validaciones básicas síncronas
      const basicValidation = await this.performBasicValidations(data);
      
      // Validaciones avanzadas con IA
      const aiValidation = await this.performAIValidations(data);
      
      // Combinar resultados
      const result = this.combineValidationResults(basicValidation, aiValidation, data);
      
      // Guardar en cache
      this.setCachedValidation(validationHash, result);
      
      console.log('✅ Validación inteligente completada:', {
        score: result.overallScore,
        issues: result.issues.length,
        riskLevel: result.aiInsights.riskLevel
      });
      
      return result;

    } catch (error) {
      console.error('❌ Error en validación inteligente:', error);
      return this.getFallbackValidation(data);
    }
  }

  private static async performBasicValidations(data: CartaPorteData): Promise<Partial<SmartValidationResult>> {
    const issues: ValidationIssue[] = [];
    
    // Validaciones SAT obligatorias
    if (!data.rfcEmisor) {
      issues.push({
        id: 'rfc-emisor-missing',
        type: 'critical',
        severity: 'critical',
        field: 'rfcEmisor',
        section: 'configuracion',
        message: 'RFC del emisor es obligatorio',
        suggestion: 'Ingrese un RFC válido de 12 o 13 caracteres',
        confidence: 1.0,
        satRule: 'Artículo 146-A RLISR',
        regulatoryContext: 'Campo obligatorio según normativa SAT'
      });
    }

    if (!data.rfcReceptor) {
      issues.push({
        id: 'rfc-receptor-missing',
        type: 'critical',
        severity: 'critical',
        field: 'rfcReceptor',
        section: 'configuracion',
        message: 'RFC del receptor es obligatorio',
        suggestion: 'Ingrese un RFC válido de 12 o 13 caracteres',
        confidence: 1.0,
        satRule: 'Artículo 146-A RLISR',
        regulatoryContext: 'Campo obligatorio según normativa SAT'
      });
    }

    // Validaciones de ubicaciones
    if (!data.ubicaciones || data.ubicaciones.length < 2) {
      issues.push({
        id: 'ubicaciones-insufficient',
        type: 'critical',
        severity: 'critical',
        field: 'ubicaciones',
        section: 'ubicaciones',
        message: 'Se requieren al menos 2 ubicaciones (origen y destino)',
        suggestion: 'Agregue ubicaciones de origen y destino completas',
        confidence: 1.0,
        satRule: 'Complemento Carta Porte v3.1',
        regulatoryContext: 'Ubicaciones mínimas requeridas'
      });
    }

    // Validaciones de mercancías
    if (!data.mercancias || data.mercancias.length === 0) {
      issues.push({
        id: 'mercancias-missing',
        type: 'critical',
        severity: 'critical',
        field: 'mercancias',
        section: 'mercancias',
        message: 'Debe especificar al menos una mercancía',
        suggestion: 'Agregue la información completa de las mercancías a transportar',
        confidence: 1.0,
        satRule: 'Complemento Carta Porte v3.1',
        regulatoryContext: 'Mercancías obligatorias'
      });
    }

    // Validaciones de autotransporte
    if (!data.autotransporte) {
      issues.push({
        id: 'autotransporte-missing',
        type: 'critical',
        severity: 'critical',
        field: 'autotransporte',
        section: 'autotransporte',
        message: 'Información del autotransporte requerida',
        suggestion: 'Complete la información del vehículo y seguros',
        confidence: 1.0,
        satRule: 'Complemento Carta Porte v3.1',
        regulatoryContext: 'Datos del autotransporte obligatorios'
      });
    }

    return { issues };
  }

  private static async performAIValidations(data: CartaPorteData): Promise<Partial<SmartValidationResult>> {
    try {
      console.log('🤖 Ejecutando validaciones con IA...');
      
      const { data: aiResult, error } = await supabase.functions.invoke('smart-validation-ai', {
        body: {
          operation: 'validate_carta_porte_complete',
          data,
          options: {
            validateCoherence: true,
            detectAnomalies: true,
            predictCompliance: true,
            generateRecommendations: true
          }
        },
      });

      if (error) {
        console.error('❌ Error en validación IA:', error);
        return { issues: [] };
      }

      return {
        aiInsights: aiResult.insights || {
          riskLevel: 'medium',
          compliancePrediction: 75,
          optimizationSuggestions: [],
          timbradoProbability: 70
        },
        recommendations: aiResult.recommendations || [],
        issues: aiResult.issues || []
      };

    } catch (error) {
      console.error('❌ Error en validaciones IA:', error);
      return { 
        issues: [],
        aiInsights: {
          riskLevel: 'medium',
          compliancePrediction: 50,
          optimizationSuggestions: ['Validación IA no disponible temporalmente'],
          timbradoProbability: 50
        }
      };
    }
  }

  private static combineValidationResults(
    basic: Partial<SmartValidationResult>,
    ai: Partial<SmartValidationResult>,
    data: CartaPorteData
  ): SmartValidationResult {
    const allIssues = [...(basic.issues || []), ...(ai.issues || [])];
    
    // Calcular scores por sección
    const sectionsStatus = this.calculateSectionScores(allIssues, data);
    
    // Score general
    const sectionScores = Object.values(sectionsStatus).map(s => s.score);
    const overallScore = Math.round(sectionScores.reduce((sum, score) => sum + score, 0) / sectionScores.length);

    // Determinar validez
    const criticalIssues = allIssues.filter(i => i.severity === 'critical');
    const isValid = criticalIssues.length === 0 && overallScore >= 80;

    // Alertas en tiempo real (issues críticos recientes)
    const realTimeAlerts = allIssues.filter(i => 
      i.severity === 'critical' || (i.severity === 'high' && i.type === 'error')
    );

    return {
      isValid,
      overallScore,
      issues: allIssues,
      sectionsStatus,
      recommendations: ai.recommendations || this.generateBasicRecommendations(allIssues),
      aiInsights: ai.aiInsights || {
        riskLevel: this.calculateRiskLevel(allIssues),
        compliancePrediction: overallScore,
        optimizationSuggestions: this.generateOptimizationSuggestions(allIssues),
        timbradoProbability: Math.max(0, overallScore - 10)
      },
      realTimeAlerts
    };
  }

  private static calculateSectionScores(issues: ValidationIssue[], data: CartaPorteData) {
    const sections = ['configuracion', 'ubicaciones', 'mercancias', 'autotransporte', 'figuras'] as const;
    const sectionsStatus: any = {};

    sections.forEach(section => {
      const sectionIssues = issues.filter(i => i.section === section);
      const criticalCount = sectionIssues.filter(i => i.severity === 'critical').length;
      const highCount = sectionIssues.filter(i => i.severity === 'high').length;
      
      let score = 100;
      score -= criticalCount * 30;
      score -= highCount * 15;
      score -= sectionIssues.length * 5;
      
      sectionsStatus[section] = {
        valid: criticalCount === 0 && score >= 70,
        score: Math.max(0, score),
        issues: sectionIssues
      };
    });

    return sectionsStatus;
  }

  private static calculateRiskLevel(issues: ValidationIssue[]): 'low' | 'medium' | 'high' {
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    
    if (criticalCount > 0 || highCount > 3) return 'high';
    if (highCount > 0 || issues.length > 5) return 'medium';
    return 'low';
  }

  private static generateBasicRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];
    
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(`Corrija ${criticalIssues.length} problema(s) crítico(s) antes del timbrado`);
    }
    
    const warningIssues = issues.filter(i => i.type === 'warning');
    if (warningIssues.length > 0) {
      recommendations.push(`Revise ${warningIssues.length} advertencia(s) para optimizar el documento`);
    }
    
    recommendations.push('Verifique que todos los datos sean consistentes antes de generar el XML');
    
    return recommendations;
  }

  private static generateOptimizationSuggestions(issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];
    
    const suggestionIssues = issues.filter(i => i.type === 'suggestion');
    suggestionIssues.forEach(issue => {
      if (issue.suggestion) {
        suggestions.push(issue.suggestion);
      }
    });
    
    if (suggestions.length === 0) {
      suggestions.push('Complete todos los campos obligatorios para mejorar la validación');
    }
    
    return suggestions;
  }

  private static getFallbackValidation(data: CartaPorteData): SmartValidationResult {
    return {
      isValid: false,
      overallScore: 50,
      issues: [{
        id: 'validation-error',
        type: 'error',
        severity: 'medium',
        field: 'general',
        section: 'general',
        message: 'Error en el sistema de validación. Verifique manualmente los datos.',
        confidence: 0.5
      }],
      sectionsStatus: {
        configuracion: { valid: false, score: 50, issues: [] },
        ubicaciones: { valid: false, score: 50, issues: [] },
        mercancias: { valid: false, score: 50, issues: [] },
        autotransporte: { valid: false, score: 50, issues: [] },
        figuras: { valid: false, score: 50, issues: [] }
      },
      recommendations: ['Sistema de validación temporalmente no disponible'],
      aiInsights: {
        riskLevel: 'medium',
        compliancePrediction: 50,
        optimizationSuggestions: ['Validación manual recomendada'],
        timbradoProbability: 30
      },
      realTimeAlerts: []
    };
  }

  private static generateValidationHash(data: CartaPorteData): string {
    const keyData = {
      rfcEmisor: data.rfcEmisor,
      rfcReceptor: data.rfcReceptor,
      ubicacionesCount: data.ubicaciones?.length || 0,
      mercanciasCount: data.mercancias?.length || 0,
      hasAutotransporte: !!data.autotransporte,
      figurasCount: data.figuras?.length || 0
    };
    
    return btoa(JSON.stringify(keyData));
  }

  private static getCachedValidation(hash: string): SmartValidationResult | null {
    const cached = this.validationCache.get(hash);
    if (!cached) return null;

    // Verificar expiración
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.validationCache.delete(hash);
      return null;
    }

    return cached.result;
  }

  private static setCachedValidation(hash: string, result: SmartValidationResult): void {
    this.validationCache.set(hash, {
      result,
      timestamp: Date.now(),
      hash
    });

    // Limpiar cache antiguo
    if (this.validationCache.size > 50) {
      this.clearOldCache();
    }
  }

  private static clearOldCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.validationCache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.validationCache.delete(key);
      }
    }
  }

  static clearValidationCache(): void {
    this.validationCache.clear();
    console.log('🗑️ Cache de validaciones limpiado');
  }
}

interface CacheEntry {
  result: SmartValidationResult;
  timestamp: number;
  hash: string;
}
