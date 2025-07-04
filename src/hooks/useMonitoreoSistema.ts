import { useState, useEffect, useCallback } from 'react';
import { monitoringService, SystemMetrics, Alert, HealthCheck } from '@/services/monitoring/MonitoringService';

export interface MetricaSistema {
  timestamp: Date;
  tipo: 'api' | 'calculo' | 'usuario' | 'error';
  evento: string;
  duracion?: number;
  exito: boolean;
  metadata: Record<string, any>;
  empresa_id: string;
  usuario_id?: string;
}

interface UseMonitoreoSistemaReturn {
  metrics: SystemMetrics[];
  alerts: Alert[];
  healthChecks: HealthCheck[];
  systemOverview: any;
  track: (metrica: MetricaSistema) => void;
  resolveAlert: (alertId: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

export const useMonitoreoSistema = (): UseMonitoreoSistemaReturn => {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [systemOverview, setSystemOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track system metrics
  const track = useCallback((metrica: MetricaSistema) => {
    try {
      console.log('📊 Tracking metric:', metrica);
      
      // Store in local storage for persistence
      const existingMetrics = JSON.parse(localStorage.getItem('system_metrics') || '[]');
      existingMetrics.push(metrica);
      
      // Keep only last 1000 metrics
      if (existingMetrics.length > 1000) {
        existingMetrics.shift();
      }
      
      localStorage.setItem('system_metrics', JSON.stringify(existingMetrics));

      // Create alert if it's an error
      if (!metrica.exito) {
        monitoringService.createAlert(
          'error',
          metrica.tipo === 'error' ? 'high' : 'medium',
          `${metrica.evento} Failed`,
          `${metrica.evento} failed for empresa ${metrica.empresa_id}`,
          metrica.tipo,
          metrica.metadata
        );
      }

      // Track API performance
      if (metrica.tipo === 'api' && metrica.duracion) {
        if (metrica.duracion > 5000) { // 5 seconds
          monitoringService.createAlert(
            'warning',
            'medium',
            'Slow API Response',
            `${metrica.evento} took ${metrica.duracion}ms to respond`,
            'api_performance',
            { duration: metrica.duracion, event: metrica.evento }
          );
        }
      }

      // Track calculation accuracy
      if (metrica.tipo === 'calculo' && metrica.metadata.precision) {
        if (metrica.metadata.precision < 0.8) { // Less than 80% accuracy
          monitoringService.createAlert(
            'warning',
            'low',
            'Low Calculation Precision',
            `${metrica.evento} has ${(metrica.metadata.precision * 100).toFixed(1)}% precision`,
            'calculation_accuracy',
            metrica.metadata
          );
        }
      }

    } catch (err) {
      console.error('Error tracking metric:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    return monitoringService.resolveAlert(alertId);
  }, []);

  // Load initial data and set up subscriptions
  useEffect(() => {
    setIsLoading(true);
    
    try {
      // Load initial data
      setMetrics(monitoringService.getMetrics());
      setAlerts(monitoringService.getAlerts());
      setHealthChecks(monitoringService.getHealthChecks());
      setSystemOverview(monitoringService.getSystemOverview());

      // Subscribe to real-time updates
      const unsubscribe = monitoringService.subscribe((update) => {
        switch (update.type) {
          case 'metrics':
            setMetrics(current => [...current.slice(-99), update.data]);
            break;
          case 'alert':
            setAlerts(current => [update.data, ...current.slice(0, 99)]);
            break;
          case 'alert_resolved':
            setAlerts(current => current.map(alert => 
              alert.id === update.data.id ? update.data : alert
            ));
            break;
          case 'health':
            setHealthChecks(update.data);
            break;
        }
        
        // Update system overview
        setSystemOverview(monitoringService.getSystemOverview());
      });

      setIsLoading(false);
      
      return unsubscribe;
      
    } catch (err) {
      console.error('Error initializing monitoring:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize monitoring');
      setIsLoading(false);
    }
  }, []);

  return {
    metrics,
    alerts,
    healthChecks,
    systemOverview,
    track,
    resolveAlert,
    isLoading,
    error
  };
};

// Helper hooks for specific tracking
export const useAPITracking = () => {
  const { track } = useMonitoreoSistema();
  
  return useCallback((
    evento: string,
    duracion: number,
    exito: boolean,
    metadata: Record<string, any> = {}
  ) => {
    track({
      timestamp: new Date(),
      tipo: 'api',
      evento,
      duracion,
      exito,
      metadata,
      empresa_id: 'current', // This would come from auth context
      usuario_id: 'current'
    });
  }, [track]);
};

export const useCalculationTracking = () => {
  const { track } = useMonitoreoSistema();
  
  return useCallback((
    evento: string,
    exito: boolean,
    precision?: number,
    metadata: Record<string, any> = {}
  ) => {
    track({
      timestamp: new Date(),
      tipo: 'calculo',
      evento,
      exito,
      metadata: { ...metadata, precision },
      empresa_id: 'current',
      usuario_id: 'current'
    });
  }, [track]);
};

export const useUserActionTracking = () => {
  const { track } = useMonitoreoSistema();
  
  return useCallback((
    evento: string,
    duracion?: number,
    metadata: Record<string, any> = {}
  ) => {
    track({
      timestamp: new Date(),
      tipo: 'usuario',
      evento,
      duracion,
      exito: true,
      metadata,
      empresa_id: 'current',
      usuario_id: 'current'
    });
  }, [track]);
};
