
import { useState, useEffect, useCallback } from 'react';
import { 
  PredictiveMonitoringService, 
  MonitoringAlert, 
  PredictiveMetrics, 
  RealTimeStatus 
} from '@/services/ai/PredictiveMonitoringService';
import { useToast } from '@/hooks/use-toast';

interface UsePredictiveMonitoringOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeAlerts?: boolean;
}

export const usePredictiveMonitoring = ({
  autoRefresh = true,
  refreshInterval = 30 * 1000, // 30 segundos
  enableRealTimeAlerts = true
}: UsePredictiveMonitoringOptions = {}) => {
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [metrics, setMetrics] = useState<PredictiveMetrics | null>(null);
  const [realTimeStatus, setRealTimeStatus] = useState<RealTimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { toast } = useToast();

  // Cargar alertas predictivas
  const loadAlerts = useCallback(async () => {
    try {
      console.log('🚨 Cargando alertas predictivas...');
      const predictiveAlerts = await PredictiveMonitoringService.generatePredictiveAlerts();
      setAlerts(predictiveAlerts);
      setLastUpdate(new Date());

      // Notificar alertas críticas
      if (enableRealTimeAlerts) {
        const criticalAlerts = predictiveAlerts.filter(a => a.severity === 'critical' && !a.resolved);
        if (criticalAlerts.length > 0) {
          toast({
            title: "🚨 Alertas Críticas Detectadas",
            description: `${criticalAlerts.length} alerta(s) crítica(s) requieren atención inmediata`,
            variant: "destructive",
          });
        }
      }

    } catch (err: any) {
      console.error('Error cargando alertas:', err);
      setError(err.message);
    }
  }, [enableRealTimeAlerts, toast]);

  // Cargar métricas predictivas
  const loadMetrics = useCallback(async () => {
    try {
      console.log('📊 Cargando métricas predictivas...');
      const predictiveMetrics = await PredictiveMonitoringService.getPredictiveMetrics();
      setMetrics(predictiveMetrics);
    } catch (err: any) {
      console.error('Error cargando métricas:', err);
      setError(err.message);
    }
  }, []);

  // Cargar estado en tiempo real
  const loadRealTimeStatus = useCallback(async () => {
    try {
      console.log('🔄 Cargando estado en tiempo real...');
      const status = await PredictiveMonitoringService.getRealTimeStatus();
      setRealTimeStatus(status);
    } catch (err: any) {
      console.error('Error cargando estado en tiempo real:', err);
      setError(err.message);
    }
  }, []);

  // Cargar todos los datos
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadAlerts(),
        loadMetrics(),
        loadRealTimeStatus()
      ]);

      toast({
        title: "Monitoreo actualizado",
        description: "Datos de monitoreo predictivo actualizados exitosamente",
      });

    } catch (err: any) {
      console.error('Error cargando datos de monitoreo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadAlerts, loadMetrics, loadRealTimeStatus, toast]);

  // Refrescar datos manualmente
  const refresh = useCallback(() => {
    PredictiveMonitoringService.clearCache();
    loadAllData();
  }, [loadAllData]);

  // Resolver alerta
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    
    toast({
      title: "Alerta resuelta",
      description: "La alerta ha sido marcada como resuelta",
    });
  }, [toast]);

  // Obtener alertas por tipo
  const getAlertsByType = useCallback((type: MonitoringAlert['type']) => {
    return alerts.filter(alert => alert.type === type && !alert.resolved);
  }, [alerts]);

  // Obtener alertas por severidad
  const getAlertsBySeverity = useCallback((severity: MonitoringAlert['severity']) => {
    return alerts.filter(alert => alert.severity === severity && !alert.resolved);
  }, [alerts]);

  // Obtener alertas activas
  const getActiveAlerts = useCallback(() => {
    return alerts.filter(alert => !alert.resolved);
  }, [alerts]);

  // Obtener métricas de mantenimiento críticas
  const getCriticalMaintenanceAlerts = useCallback(() => {
    if (!metrics) return [];
    return metrics.maintenancePredictions.filter(pred => pred.severity === 'high');
  }, [metrics]);

  // Calcular score de salud general
  const getOverallHealthScore = useCallback(() => {
    if (!realTimeStatus || !metrics) return 0;
    
    const systemHealth = realTimeStatus.systemHealth;
    const alertImpact = Math.max(0, 100 - (getActiveAlerts().length * 5));
    const performanceScore = Object.values(metrics.performanceIndicators)
      .reduce((sum, val) => sum + Math.max(0, val), 0) / 4;
    
    return Math.round((systemHealth + alertImpact + performanceScore) / 3);
  }, [realTimeStatus, metrics, getActiveAlerts]);

  // Obtener recomendaciones automáticas
  const getAutomatedRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    
    const criticalAlerts = getAlertsBySeverity('critical');
    const highAlerts = getAlertsBySeverity('high');
    
    if (criticalAlerts.length > 0) {
      recommendations.push(`Atender inmediatamente ${criticalAlerts.length} alerta(s) crítica(s)`);
    }
    
    if (highAlerts.length > 3) {
      recommendations.push('Revisar procesos operativos para reducir alertas de alta prioridad');
    }
    
    if (metrics?.maintenancePredictions.some(p => p.estimatedDaysToFailure <= 7)) {
      recommendations.push('Programar mantenimiento preventivo urgente');
    }
    
    if (realTimeStatus && realTimeStatus.systemHealth < 85) {
      recommendations.push('Revisar salud general del sistema');
    }
    
    return recommendations;
  }, [getAlertsBySeverity, metrics, realTimeStatus]);

  // Carga inicial
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadRealTimeStatus(); // Solo actualizar estado en tiempo real
      
      // Cargar datos completos cada 5 minutos
      if (lastUpdate && Date.now() - lastUpdate.getTime() > 5 * 60 * 1000) {
        loadAllData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadAllData, loadRealTimeStatus, lastUpdate]);

  return {
    // Datos principales
    alerts,
    metrics,
    realTimeStatus,
    
    // Estado
    loading,
    error,
    lastUpdate,
    
    // Funciones
    refresh,
    resolveAlert,
    loadAlerts,
    loadMetrics,
    loadRealTimeStatus,
    
    // Utilidades de filtrado
    getAlertsByType,
    getAlertsBySeverity,
    getActiveAlerts,
    getCriticalMaintenanceAlerts,
    
    // Métricas calculadas
    getOverallHealthScore,
    getAutomatedRecommendations,
    
    // Estadísticas
    totalAlerts: alerts.length,
    activeAlerts: getActiveAlerts().length,
    criticalAlerts: getAlertsBySeverity('critical').length,
    healthScore: getOverallHealthScore()
  };
};
