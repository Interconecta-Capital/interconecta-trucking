
import { supabase } from '@/integrations/supabase/client';

export interface PredictiveAlert {
  id: string;
  type: 'maintenance' | 'compliance' | 'route' | 'fuel' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  predictedDate: Date;
  confidence: number;
  actionRequired: boolean;
  estimatedCost?: number;
  preventiveMeasures: string[];
  resolved?: boolean;
}

export interface MonitoringAlert extends PredictiveAlert {}

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

export interface PredictiveMetrics {
  maintenancePredictions: MaintenancePrediction[];
  complianceAlerts: ComplianceAlert[];
  routeOptimizations: Array<{
    routeId: string;
    potentialSavings: number;
    recommendedChanges: string[];
  }>;
  fuelEfficiencyTips: string[];
  overallRiskScore: number;
  performanceIndicators: {
    fuelEfficiency: number;
    maintenanceScore: number;
    complianceScore: number;
    routeOptimization: number;
  };
}

export interface RealTimeStatus {
  systemHealth: number;
  activeAlerts: number;
  vehiclesTracked: number;
  lastUpdate: Date;
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

  static async generatePredictiveAlerts(userId?: string): Promise<PredictiveAlert[]> {
    console.log('🔮 [PredictiveMonitoring] Generando alertas predictivas...');

    const cacheKey = `alerts_${userId || 'anonymous'}`;
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

  static async getPredictiveMetrics(userId?: string, timeframe: string = '30d'): Promise<PredictiveMetrics> {
    console.log('📊 [PredictiveMonitoring] Obteniendo métricas predictivas...');

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
        return this.getFallbackMetrics();
      }

      return {
        maintenancePredictions: (aiResult.maintenanceAlerts || []).map((alert: any) => ({
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
        overallRiskScore: aiResult.overallRiskScore || 50,
        performanceIndicators: {
          fuelEfficiency: aiResult.performanceIndicators?.fuelEfficiency || 70,
          maintenanceScore: aiResult.performanceIndicators?.maintenanceScore || 75,
          complianceScore: aiResult.performanceIndicators?.complianceScore || 80,
          routeOptimization: aiResult.performanceIndicators?.routeOptimization || 65
        }
      };

    } catch (error) {
      console.error('❌ Error obteniendo métricas:', error);
      return this.getFallbackMetrics();
    }
  }

  static async getRealTimeStatus(): Promise<RealTimeStatus> {
    console.log('🔄 [PredictiveMonitoring] Cargando estado en tiempo real...');

    try {
      // Simulate real-time status for now
      return {
        systemHealth: Math.floor(Math.random() * 20) + 80, // 80-100
        activeAlerts: Math.floor(Math.random() * 10),
        vehiclesTracked: Math.floor(Math.random() * 50) + 10,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('❌ Error cargando estado en tiempo real:', error);
      return {
        systemHealth: 85,
        activeAlerts: 0,
        vehiclesTracked: 0,
        lastUpdate: new Date()
      };
    }
  }

  static async getPredictiveInsights(userId: string, timeframe: string = '30d'): Promise<PredictiveInsights> {
    const metrics = await this.getPredictiveMetrics(userId, timeframe);
    return {
      maintenanceAlerts: metrics.maintenancePredictions,
      complianceAlerts: metrics.complianceAlerts,
      routeOptimizations: metrics.routeOptimizations,
      fuelEfficiencyTips: metrics.fuelEfficiencyTips,
      overallRiskScore: metrics.overallRiskScore
    };
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
      severity: this.normalizeSeverityForAlert(alert.severity),
      title: alert.title || 'Alerta Predictiva',
      description: alert.description || 'Se ha detectado un posible problema',
      predictedDate: new Date(alert.predictedDate || Date.now() + 7 * 24 * 60 * 60 * 1000),
      confidence: alert.confidence || 0.7,
      actionRequired: alert.actionRequired || false,
      estimatedCost: alert.estimatedCost,
      preventiveMeasures: alert.preventiveMeasures || [],
      resolved: false
    }));
  }

  private static normalizeSeverityForAlert(severity: any): 'low' | 'medium' | 'high' | 'critical' {
    const normalizedSeverity = String(severity).toLowerCase();
    if (['low', 'medium', 'high', 'critical'].includes(normalizedSeverity)) {
      return normalizedSeverity as 'low' | 'medium' | 'high' | 'critical';
    }
    return 'medium'; // default fallback
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
        preventiveMeasures: ['Verificar conectividad del sistema'],
        resolved: false
      }
    ];
  }

  private static getFallbackMetrics(): PredictiveMetrics {
    return {
      maintenancePredictions: [],
      complianceAlerts: [],
      routeOptimizations: [],
      fuelEfficiencyTips: ['Sistema de métricas temporalmente no disponible'],
      overallRiskScore: 50,
      performanceIndicators: {
        fuelEfficiency: 50,
        maintenanceScore: 50,
        complianceScore: 50,
        routeOptimization: 50
      }
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
