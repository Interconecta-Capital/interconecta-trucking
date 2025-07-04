
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Server,
  Database,
  Zap,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import { useMonitoreoSistema } from '@/hooks/useMonitoreoSistema';
import { Alert as AlertType, HealthCheck, SystemMetrics } from '@/services/monitoring/MonitoringService';

export const AdminMonitoringDashboard: React.FC = () => {
  const { 
    metrics, 
    alerts, 
    healthChecks, 
    systemOverview, 
    resolveAlert, 
    isLoading 
  } = useMonitoreoSistema();

  const [selectedTab, setSelectedTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando métricas del sistema...</span>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'down': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: AlertType['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const latestMetrics = metrics[metrics.length - 1];

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Estado del Sistema
            <Badge 
              variant="outline" 
              className={getStatusColor(systemOverview?.status || 'unknown')}
            >
              {systemOverview?.status || 'Unknown'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemOverview?.alerts?.total || 0}
              </div>
              <p className="text-sm text-gray-600">Alertas Activas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {latestMetrics?.performance.availability ? 
                  `${(latestMetrics.performance.availability * 100).toFixed(2)}%` : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Disponibilidad</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {latestMetrics?.performance.responseTime ? 
                  `${latestMetrics.performance.responseTime.toFixed(0)}ms` : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Tiempo Respuesta</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {latestMetrics?.resources.activeUsers || 0}
              </div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="health">Servicios</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Tiempo de Respuesta</span>
                      <span>{latestMetrics?.performance.responseTime?.toFixed(0) || 0}ms</span>
                    </div>
                    <Progress 
                      value={Math.min((latestMetrics?.performance.responseTime || 0) / 50, 100)} 
                      className="h-2 mt-1" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Tasa de Error</span>
                      <span>{((latestMetrics?.performance.errorRate || 0) * 100).toFixed(2)}%</span>
                    </div>
                    <Progress 
                      value={(latestMetrics?.performance.errorRate || 0) * 100} 
                      className="h-2 mt-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  Recursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Uso de Memoria</span>
                      <span>{((latestMetrics?.resources.memoryUsage || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={(latestMetrics?.resources.memoryUsage || 0) * 100} 
                      className="h-2 mt-1" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Cache Hit Rate</span>
                      <span>{((latestMetrics?.resources.cacheHitRate || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={(latestMetrics?.resources.cacheHitRate || 0) * 100} 
                      className="h-2 mt-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Negocio (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cartas Porte</span>
                    <span className="font-medium">{latestMetrics?.business.cartasPorteCreated || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Timbrados OK</span>
                    <span className="font-medium text-green-600">{latestMetrics?.business.timbradosSuccessful || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Timbrados Error</span>
                    <span className="font-medium text-red-600">{latestMetrics?.business.timbradosFailed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ingresos</span>
                    <span className="font-medium">${(latestMetrics?.business.revenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthChecks.map((check) => (
              <Card key={check.service}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="capitalize">{check.service.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(check.status)}
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(check.status)}
                      >
                        {check.status}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tiempo de Respuesta</span>
                      <span>{check.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Última Verificación</span>
                      <span>{check.lastCheck.toLocaleTimeString()}</span>
                    </div>
                    {Object.entries(check.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs text-gray-600">
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                        <span>{typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No hay alertas activas</p>
              </CardContent>
            </Card>
          ) : (
            alerts.slice(0, 20).map((alert) => (
              <Alert key={alert.id} className="relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSeverityColor(alert.severity)}`} />
                <div className="ml-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{alert.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getSeverityColor(alert.severity) + ' text-white'}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleString()}
                      </span>
                      {!alert.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                  <AlertDescription>
                    {alert.message}
                  </AlertDescription>
                  <div className="mt-2 text-xs text-gray-500">
                    Fuente: {alert.source}
                  </div>
                </div>
              </Alert>
            ))
          )}
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Métricas del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Gráficos de métricas en tiempo real se implementarán aquí
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Integrar con biblioteca de gráficos como Recharts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
