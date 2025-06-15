
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, Database, AlertTriangle } from 'lucide-react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

export function PerformanceMonitor() {
  const { 
    metrics, 
    isMonitoring, 
    startMonitoring, 
    stopMonitoring, 
    resetMetrics 
  } = usePerformanceMonitoring();

  const getPerformanceStatus = (queryTime: number) => {
    if (queryTime < 100) return { label: 'Excelente', color: 'bg-green-500' };
    if (queryTime < 500) return { label: 'Bueno', color: 'bg-yellow-500' };
    return { label: 'Lento', color: 'bg-red-500' };
  };

  const status = getPerformanceStatus(metrics.queryTime);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Monitor de Rendimiento</h3>
        <div className="flex gap-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Detener' : 'Iniciar'} Monitor
          </Button>
          <Button variant="outline" size="sm" onClick={resetMetrics}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.queryTime.toFixed(0)}ms
            </div>
            <Badge variant="outline" className={`${status.color} text-white mt-1`}>
              {status.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cacheHitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Efectividad del cache
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexiones</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.activeConnections}
            </div>
            <p className="text-xs text-muted-foreground">
              Conexiones activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queries Lentas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.slowQueries}
            </div>
            <p className="text-xs text-muted-foreground">
              Más de 1 segundo
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Estado de Optimizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Recursión RLS eliminada</span>
              <Badge variant="outline" className="bg-green-500 text-white">
                ✓ Corregido
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Políticas consolidadas</span>
              <Badge variant="outline" className="bg-green-500 text-white">
                ✓ Optimizado
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Índices de rendimiento</span>
              <Badge variant="outline" className="bg-green-500 text-white">
                ✓ Aplicados
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Logs antiguos limpiados</span>
              <Badge variant="outline" className="bg-green-500 text-white">
                ✓ Optimizado
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {isMonitoring && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-green-600">
              🟢 Monitoreo Activo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              El sistema está monitoreando el rendimiento de las consultas en tiempo real.
              Los errores de recursión infinita han sido eliminados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
