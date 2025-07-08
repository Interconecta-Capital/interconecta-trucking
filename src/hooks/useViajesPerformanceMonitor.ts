
import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  concurrentUsers: number;
  queueSize: number;
}

interface PerformanceAlert {
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

export const useViajesPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    requestsPerSecond: 0,
    averageResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    concurrentUsers: 0,
    queueSize: 0
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Simular métricas de rendimiento
  const updateMetrics = useCallback(() => {
    const newMetrics: PerformanceMetrics = {
      requestsPerSecond: Math.floor(Math.random() * 100) + 50,
      averageResponseTime: Math.floor(Math.random() * 500) + 100,
      errorRate: Math.random() * 5,
      cacheHitRate: Math.random() * 30 + 70,
      concurrentUsers: Math.floor(Math.random() * 1000) + 100,
      queueSize: Math.floor(Math.random() * 50)
    };

    setMetrics(newMetrics);

    // Generar alertas basadas en métricas
    const newAlerts: PerformanceAlert[] = [];

    if (newMetrics.averageResponseTime > 1000) {
      newAlerts.push({
        level: 'warning',
        message: `Tiempo de respuesta alto: ${newMetrics.averageResponseTime}ms`,
        timestamp: Date.now()
      });
    }

    if (newMetrics.errorRate > 10) {
      newAlerts.push({
        level: 'error',
        message: `Tasa de error alta: ${newMetrics.errorRate.toFixed(1)}%`,
        timestamp: Date.now()
      });
    }

    if (newMetrics.concurrentUsers > 8000) {
      newAlerts.push({
        level: 'warning',
        message: `Usuarios concurrentes: ${newMetrics.concurrentUsers}`,
        timestamp: Date.now()
      });
    }

    if (newMetrics.queueSize > 100) {
      newAlerts.push({
        level: 'error',
        message: `Cola saturada: ${newMetrics.queueSize} requests`,
        timestamp: Date.now()
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
    }
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Effect para actualizar métricas
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, [isMonitoring, updateMetrics]);

  // Recomendaciones de optimización
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.averageResponseTime > 500) {
      recommendations.push('Considerar aumentar el cache TTL');
      recommendations.push('Implementar paginación en consultas grandes');
    }

    if (metrics.cacheHitRate < 60) {
      recommendations.push('Optimizar estrategia de cache');
      recommendations.push('Aumentar tiempo de vida del cache');
    }

    if (metrics.concurrentUsers > 5000) {
      recommendations.push('Implementar rate limiting más agresivo');
      recommendations.push('Considerar escalado horizontal');
    }

    if (metrics.queueSize > 50) {
      recommendations.push('Aumentar workers de procesamiento');
      recommendations.push('Implementar backpressure');
    }

    return recommendations;
  }, [metrics]);

  return {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    getOptimizationRecommendations
  };
};
