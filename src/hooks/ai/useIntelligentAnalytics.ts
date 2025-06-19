
import { useState, useEffect, useCallback } from 'react';
import { 
  IntelligentAnalyticsService, 
  AnalyticsInsight, 
  BusinessMetrics, 
  PredictiveAnalysis,
  ComplianceAnalysis 
} from '@/services/ai/IntelligentAnalyticsService';
import { useToast } from '@/hooks/use-toast';

interface UseIntelligentAnalyticsOptions {
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useIntelligentAnalytics = ({
  timeframe = 'month',
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5 minutos
}: UseIntelligentAnalyticsOptions = {}) => {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [predictions, setPredictions] = useState<PredictiveAnalysis | null>(null);
  const [compliance, setCompliance] = useState<ComplianceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { toast } = useToast();

  // Cargar insights de negocio
  const loadInsights = useCallback(async () => {
    try {
      console.log('🔍 Cargando insights de negocio...');
      const businessInsights = await IntelligentAnalyticsService.generateBusinessInsights(timeframe);
      setInsights(businessInsights);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Error cargando insights:', err);
      setError(err.message);
      toast({
        title: "Error cargando insights",
        description: "No se pudieron cargar los insights de negocio",
        variant: "destructive",
      });
    }
  }, [timeframe, toast]);

  // Cargar métricas de negocio
  const loadMetrics = useCallback(async () => {
    try {
      console.log('📊 Cargando métricas de negocio...');
      const businessMetrics = await IntelligentAnalyticsService.getBusinessMetrics(timeframe);
      setMetrics(businessMetrics);
    } catch (err: any) {
      console.error('Error cargando métricas:', err);
      setError(err.message);
    }
  }, [timeframe]);

  // Cargar análisis predictivo
  const loadPredictions = useCallback(async () => {
    try {
      console.log('🔮 Cargando análisis predictivo...');
      const predictiveAnalysis = await IntelligentAnalyticsService.getPredictiveAnalysis();
      setPredictions(predictiveAnalysis);
    } catch (err: any) {
      console.error('Error cargando predicciones:', err);
      setError(err.message);
    }
  }, []);

  // Cargar análisis de cumplimiento
  const loadCompliance = useCallback(async () => {
    try {
      console.log('⚖️ Cargando análisis de cumplimiento...');
      const complianceAnalysis = await IntelligentAnalyticsService.getComplianceAnalysis();
      setCompliance(complianceAnalysis);
    } catch (err: any) {
      console.error('Error cargando cumplimiento:', err);
      setError(err.message);
    }
  }, []);

  // Cargar todos los datos
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadInsights(),
        loadMetrics(),
        loadPredictions(),
        loadCompliance()
      ]);

      toast({
        title: "Analytics actualizados",
        description: "Datos de inteligencia de negocio actualizados exitosamente",
      });

    } catch (err: any) {
      console.error('Error cargando analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadInsights, loadMetrics, loadPredictions, loadCompliance, toast]);

  // Refrescar datos manualmente
  const refresh = useCallback(() => {
    IntelligentAnalyticsService.clearCache();
    loadAllData();
  }, [loadAllData]);

  // Obtener insights por tipo
  const getInsightsByType = useCallback((type: AnalyticsInsight['type']) => {
    return insights.filter(insight => insight.type === type);
  }, [insights]);

  // Obtener insights de alta prioridad
  const getHighPriorityInsights = useCallback(() => {
    return insights.filter(insight => insight.impact === 'high' || insight.impact === 'critical');
  }, [insights]);

  // Calcular score general del negocio
  const getOverallBusinessScore = useCallback(() => {
    if (!metrics || !compliance) return 0;
    
    const metricsScore = (
      (metrics.profitMargin > 20 ? 25 : metrics.profitMargin > 10 ? 15 : 5) +
      (metrics.complianceScore > 90 ? 25 : metrics.complianceScore > 70 ? 15 : 5) +
      (metrics.fuelEfficiency > 10 ? 25 : metrics.fuelEfficiency > 8 ? 15 : 5) +
      (metrics.customerSatisfaction > 8 ? 25 : metrics.customerSatisfaction > 6 ? 15 : 5)
    );

    const complianceScore = compliance.overallScore;
    
    return Math.round((metricsScore + complianceScore) / 2);
  }, [metrics, compliance]);

  // Generar recomendaciones automáticas
  const getAutomatedRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics) {
      if (metrics.profitMargin < 15) {
        recommendations.push('Optimizar costos operativos para mejorar rentabilidad');
      }
      if (metrics.fuelEfficiency < 8) {
        recommendations.push('Implementar programa de eficiencia de combustible');
      }
      if (metrics.avgDeliveryTime > 48) {
        recommendations.push('Optimizar rutas para reducir tiempos de entrega');
      }
    }

    if (compliance && compliance.overallScore < 85) {
      recommendations.push('Reforzar procesos de cumplimiento normativo');
    }

    const criticalInsights = insights.filter(i => i.impact === 'critical');
    if (criticalInsights.length > 0) {
      recommendations.push('Atender inmediatamente los insights críticos identificados');
    }

    return recommendations;
  }, [metrics, compliance, insights]);

  // Carga inicial
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAllData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadAllData]);

  return {
    // Datos
    insights,
    metrics,
    predictions,
    compliance,
    
    // Estado
    loading,
    error,
    lastUpdate,
    
    // Funciones
    refresh,
    loadInsights,
    loadMetrics,
    loadPredictions,
    loadCompliance,
    
    // Utilidades
    getInsightsByType,
    getHighPriorityInsights,
    getOverallBusinessScore,
    getAutomatedRecommendations,
    
    // Estadísticas
    totalInsights: insights.length,
    criticalInsights: insights.filter(i => i.impact === 'critical').length,
    businessScore: getOverallBusinessScore()
  };
};
