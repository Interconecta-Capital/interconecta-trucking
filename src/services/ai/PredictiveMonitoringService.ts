
import { supabase } from '@/integrations/supabase/client';

export interface PredictiveAlert {
  id: string;
  type: 'maintenance' | 'compliance' | 'route' | 'fuel' | 'safety';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  predictedDate: Date;
  confidence: number;
  actionRequired: boolean;
  estimatedCost?: number;
  preventiveMeasures: string[];
}

export interface MaintenancePrediction {
  vehicleId: string;
  component: string;
  failureProbability: number;
  estimatedDaysToFailure: number;
  severity: 'low' | 'medium' | 'high';
  costImpact: number;
}

export interface ComplianceAlert {
  documentType: string;
  expirationDate: Date;
  riskLevel: 'low' | 'medium' | 'high';
  affectedOperations: string[];
}

export interface PredictiveInsights {
  maintenanceAlerts: MaintenancePrediction[];
  complianceAlerts: ComplianceAlert[];
  routeOptimizations: Array<{
    routeId: string;
    potentialSavings: number;
    recommendedChanges: string[];
  }>;
  fuelEfficiencyTips: string[];
  overallRiskScore: number;
}

export class PredictiveMonitoringService {
  private static readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private static cache = new Map<string, { data: any; timestamp: number }>();

  static async generatePredictiveAlerts(userId: string): Promise<PredictiveAlert[]> {
    console.log('🔮 [PredictiveMonitoring] Generando alertas predictivas...');

    const cacheKey = `alerts_${userId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('✅ Alertas obtenidas del cache');
      return cached;
    }

    try {
      const { data: aiResult, error } = await supabase.functions.invoke('predictive-ai', {
        body: {
          operation: 'generate_alerts',
          userId,
          options: {
            includeMaintenanceAlerts: true,
            includeComplianceAlerts: true,
            includeRouteOptimizations: true,
            lookAheadDays: 30
          }
        },
      });

      if (error) {
        console.error('❌ Error en AI predictiva:', error);
        return this.getFallbackAlerts();
      }

      const alerts = this.processAIAlerts(aiResult.alerts || []);
      this.setCachedData(cacheKey, alerts);
      
      console.log('✅ Alertas predictivas generadas:', alerts.length);
      return alerts;

    } catch (error) {
      console.error('❌ Error generando alertas predictivas:', error);
      return this.getFallbackAlerts();
    }
  }

  static async getPredictiveInsights(userId: string, timeframe: string = '30d'): Promise<PredictiveInsights> {
    console.log('📊 [PredictiveMonitoring] Obteniendo insights predictivos...');

    try {
      const { data: aiResult, error } = await supabase.functions.invoke('predictive-ai', {
        body: {
          operation: 'generate_insights',
          userId,
          timeframe,
          options: {
            analyzeMaintenancePatterns: true,
            analyzeComplianceRisks: true,
            analyzeRouteEfficiency: true,
            analyzeFuelConsumption: true
          }
        },
      });

      if (error) {
        console.error('❌ Error en insights AI:', error);
        return this.getFallbackInsights();
      }

      return {
        maintenanceAlerts: (aiResult.maintenanceAlerts || []).map((alert: any) => ({
          vehicleId: String(alert.vehicleId || ''),
          component: alert.component,
          failureProbability: alert.failureProbability,
          estimatedDaysToFailure: alert.estimatedDaysToFailure,
          severity: this.normalizeSeverity(alert.severity),
          costImpact: alert.costImpact
        })) as MaintenancePrediction[],
        complianceAlerts: (aiResult.complianceAlerts || []).map((alert: any) => ({
          documentType: String(alert.documentType || ''),
          expirationDate: new Date(alert.expirationDate),
          riskLevel: this.normalizeRiskLevel(alert.riskLevel),
          affectedOperations: alert.affectedOperations || []
        })) as ComplianceAlert[],
        routeOptimizations: aiResult.routeOptimizations || [],
        fuelEfficiencyTips: aiResult.fuelEfficiencyTips || [],
        overallRiskScore: aiResult.overallRiskScore || 50
      };

    } catch (error) {
      console.error('❌ Error obteniendo insights:', error);
      return this.getFallbackInsights();
    }
  }

  private static normalizeSeverity(severity: any): 'low' | 'medium' | 'high' {
    const normalizedSeverity = String(severity).toLowerCase();
    if (['low', 'medium', 'high'].includes(normalizedSeverity)) {
      return normalizedSeverity as 'low' | 'medium' | 'high';
    }
    return 'medium'; // default fallback
  }

  private static normalizeRiskLevel(riskLevel: any): 'low' | 'medium' | 'high' {
    const normalizedRisk = String(riskLevel).toLowerCase();
    if (['low', 'medium', 'high'].includes(normalizedRisk)) {
      return normalizedRisk as 'low' | 'medium' | 'high';
    }
    return 'medium'; // default fallback
  }

  private static processAIAlerts(aiAlerts: any[]): PredictiveAlert[] {
    return aiAlerts.map(alert => ({
      id: alert.id || this.generateAlertId(),
      type: alert.type || 'maintenance',
      severity: this.normalizeSeverity(alert.severity),
      title: alert.title || 'Alerta Predictiva',
      description: alert.description || 'Se ha detectado un posible problema',
      predictedDate: new Date(alert.predictedDate || Date.now() + 7 * 24 * 60 * 60 * 1000),
      confidence: alert.confidence || 0.7,
      actionRequired: alert.actionRequired || false,
      estimatedCost: alert.estimatedCost,
      preventiveMeasures: alert.preventiveMeasures || []
    }));
  }

  private static getFallbackAlerts(): PredictiveAlert[] {
    return [
      {
        id: 'fallback-1',
        type: 'maintenance',
        severity: 'medium',
        title: 'Sistema de Monitoreo Predictivo',
        description: 'El sistema de alertas predictivas está temporalmente no disponible',
        predictedDate: new Date(),
        confidence: 0.5,
        actionRequired: false,
        preventiveMeasures: ['Verificar conectividad del sistema']
      }
    ];
  }

  private static getFallbackInsights(): PredictiveInsights {
    return {
      maintenanceAlerts: [],
      complianceAlerts: [],
      routeOptimizations: [],
      fuelEfficiencyTips: ['Sistema de insights temporalmente no disponible'],
      overallRiskScore: 50
    };
  }

  private static generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private static getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private static setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  static clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache de monitoreo predictivo limpiado');
  }
}
