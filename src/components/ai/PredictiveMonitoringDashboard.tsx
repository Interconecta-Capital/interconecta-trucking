
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Shield,
  Truck,
  Wrench,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  BarChart3
} from 'lucide-react';
import { usePredictiveMonitoring } from '@/hooks/ai/usePredictiveMonitoring';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

export function PredictiveMonitoringDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  
  const {
    alerts,
    metrics,
    realTimeStatus,
    loading,
    error,
    lastUpdate,
    refresh,
    resolveAlert,
    getAlertsByType,
    getAlertsBySeverity,
    getActiveAlerts,
    getCriticalMaintenanceAlerts,
    getOverallHealthScore,
    getAutomatedRecommendations,
    activeAlerts,
    criticalAlerts,
    healthScore
  } = usePredictiveMonitoring();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'delay': return <Clock className="h-4 w-4" />;
      case 'route_deviation': return <Activity className="h-4 w-4" />;
      case 'fuel_efficiency': return <Zap className="h-4 w-4" />;
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const performanceData = metrics?.performanceIndicators ? [
    { name: 'Eficiencia Combustible', value: metrics.performanceIndicators.fuelEfficiency, color: '#8884d8' },
    { name: 'Tiempo Entrega', value: metrics.performanceIndicators.maintenanceScore, color: '#82ca9d' },
    { name: 'Satisfacción Cliente', value: metrics.performanceIndicators.complianceScore, color: '#ffc658' },
    { name: 'Costos Mantenimiento', value: metrics.performanceIndicators.routeOptimization, color: '#ff7300' }
  ] : [];

  const recommendations = getAutomatedRecommendations();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 space-x-2">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span>Cargando monitoreo predictivo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            Monitoreo Predictivo en Tiempo Real
          </h2>
          <p className="text-muted-foreground">
            Sistema de alertas y análisis predictivo para operaciones de transporte
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Última actualización:</span>
            <span className="text-sm">{lastUpdate?.toLocaleTimeString()}</span>
          </div>
          
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Real-time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Salud del Sistema</p>
                <p className="text-2xl font-bold">{healthScore}/100</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={healthScore} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Activas</p>
                <p className="text-2xl font-bold">{activeAlerts}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${activeAlerts > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
            {criticalAlerts > 0 && (
              <Badge variant="destructive" className="mt-2">
                {criticalAlerts} críticas
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vehículos Activos</p>
                <p className="text-2xl font-bold">{realTimeStatus?.vehiclesTracked || 0}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sistema en Línea</p>
                <p className="text-2xl font-bold">{Math.round((realTimeStatus?.systemHealth || 0))}%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticas que Requieren Atención Inmediata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getAlertsBySeverity('critical').slice(0, 3).map((alert) => (
                <Alert key={alert.id} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{alert.title}</strong>
                        <p className="mt-1">{alert.description}</p>
                        <p className="text-sm mt-2 font-medium">⚡ ${alert.estimatedCost?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {Math.round((alert.confidence || 0) * 100)}%
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolver
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alertas Activas</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento Predictivo</TabsTrigger>
          <TabsTrigger value="performance">Indicadores de Rendimiento</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertas por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['maintenance', 'compliance', 'safety', 'fuel_efficiency'].map((type) => {
                    const typeAlerts = getAlertsByType(type as any);
                    return (
                      <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(type)}
                          <span className="capitalize">{type.replace('_', ' ')}</span>
                        </div>
                        <Badge variant={typeAlerts.length > 0 ? "default" : "secondary"}>
                          {typeAlerts.length}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Lista de Alertas */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {getActiveAlerts().slice(0, 10).map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mt-1">
                        {getSeverityIcon(alert.severity)}
                        {getTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{alert.title}</p>
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.predictedDate.toLocaleDateString()} • {Math.round((alert.confidence || 0) * 100)}% confianza
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predicciones de Mantenimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getCriticalMaintenanceAlerts().map((prediction, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        <span className="font-medium">Vehículo {prediction.vehicleId.slice(-8)}</span>
                      </div>
                      <Badge variant={prediction.severity === 'high' ? "destructive" : "default"}>
                        {prediction.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Componente: {prediction.component}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Probabilidad de falla:</span>
                        <p className="font-medium">{Math.round(prediction.failureProbability * 100)}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tiempo estimado:</span>
                        <p className="font-medium">{prediction.estimatedDaysToFailure} días</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Impacto en costos:</span>
                        <p className="font-medium">${prediction.costImpact.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getCriticalMaintenanceAlerts().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No hay alertas críticas de mantenimiento</p>
                    <p className="text-sm">Todos los vehículos están en buen estado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceData.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <div className="flex items-center gap-1">
                      {metric.value > 50 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-bold ${metric.value > 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.value}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Recomendaciones Automáticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
                
                {recommendations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>¡Excelente! No hay recomendaciones críticas en este momento.</p>
                    <p className="text-sm">Su operación está funcionando eficientemente.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
