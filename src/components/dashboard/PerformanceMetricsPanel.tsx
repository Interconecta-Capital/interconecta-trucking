
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useOptimizedQueries } from '@/hooks/useOptimizedQueries';
import { Activity, Gauge, TrendingUp, Zap, RefreshCw } from 'lucide-react';

export function PerformanceMetricsPanel() {
  const { 
    metrics, 
    isMonitoring, 
    startMonitoring, 
    stopMonitoring, 
    resetMetrics 
  } = usePerformanceMonitoring();
  
  const { queryPerformance } = useOptimizedQueries();

  // Iniciar monitoreo automáticamente
  useEffect(() => {
    if (!isMonitoring) {
      startMonitoring();
    }
    
    return () => {
      stopMonitoring();
    };
  }, [isMonitoring, startMonitoring, stopMonitoring]);

  const getPerformanceStatus = (queryTime: number) => {
    if (queryTime < 100) return { status: 'excellent', color: 'bg-green-500', label: 'Excelente' };
    if (queryTime < 300) return { status: 'good', color: 'bg-blue-500', label: 'Bueno' };
    if (queryTime < 1000) return { status: 'fair', color: 'bg-yellow-500', label: 'Regular' };
    return { status: 'poor', color: 'bg-red-500', label: 'Lento' };
  };

  const performance = getPerformanceStatus(metrics.queryTime);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Métricas de Rendimiento
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetMetrics}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </Button>
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'Activo' : 'Pausado'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tiempo de consultas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Consultas DB</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${performance.color}`}></div>
              <span className="text-2xl font-bold">{metrics.queryTime.toFixed(0)}ms</span>
            </div>
            <p className="text-xs text-muted-foreground">{performance.label}</p>
          </div>

          {/* Cache Hit Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Cache Hit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-2xl font-bold">{queryPerformance.cacheHitRate.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Eficiencia de caché</p>
          </div>

          {/* Consultas lentas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Consultas Lentas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${metrics.slowQueries > 0 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
              <span className="text-2xl font-bold">{metrics.slowQueries}</span>
            </div>
            <p className="text-xs text-muted-foreground">Últimas 100 consultas</p>
          </div>

          {/* Optimizaciones aplicadas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Optimizaciones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-2xl font-bold">15</span>
            </div>
            <p className="text-xs text-muted-foreground">Fases 1-4 aplicadas</p>
          </div>
        </div>

        {/* Barra de progreso de rendimiento */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Rendimiento General</span>
            <span className="text-sm text-muted-foreground">
              {queryPerformance.overallScore.toFixed(0)}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                queryPerformance.overallScore >= 80 ? 'bg-green-500' :
                queryPerformance.overallScore >= 60 ? 'bg-blue-500' :
                queryPerformance.overallScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(queryPerformance.overallScore, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Recomendaciones */}
        {queryPerformance.overallScore < 80 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Recomendaciones</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              {metrics.queryTime > 300 && <li>• Considera optimizar consultas complejas</li>}
              {queryPerformance.cacheHitRate < 70 && <li>• Implementa más caché inteligente</li>}
              {metrics.slowQueries > 5 && <li>• Revisa índices de base de datos</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
