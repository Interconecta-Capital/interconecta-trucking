
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Brain,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Target,
  DollarSign,
  Clock,
  Shield,
  Fuel,
  Users,
  Route
} from 'lucide-react';
import { useIntelligentAnalytics } from '@/hooks/ai/useIntelligentAnalytics';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

export function IntelligentAnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  const {
    insights,
    metrics,
    predictions,
    compliance,
    loading,
    error,
    lastUpdate,
    refresh,
    getInsightsByType,
    getHighPriorityInsights,
    getOverallBusinessScore,
    getAutomatedRecommendations,
    businessScore
  } = useIntelligentAnalytics({ timeframe: selectedTimeframe });

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const performanceInsights = getInsightsByType('performance');
  const costInsights = getInsightsByType('cost');
  const complianceInsights = getInsightsByType('compliance');
  const efficiencyInsights = getInsightsByType('efficiency');
  const highPriorityInsights = getHighPriorityInsights();
  const recommendations = getAutomatedRecommendations();

  const chartData = predictions?.seasonalTrends?.map(trend => ({
    month: trend.month,
    revenue: trend.expectedRevenue,
    volume: trend.expectedVolume
  })) || [];

  const complianceData = compliance ? [
    { name: 'SAT', value: compliance.satCompliance, color: '#8884d8' },
    { name: 'Documentación', value: compliance.documentationScore, color: '#82ca9d' },
    { name: 'Seguridad', value: compliance.safetyScore, color: '#ffc658' }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 space-x-2">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span>Generando análisis inteligente...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Analytics Inteligentes
          </h2>
          <p className="text-muted-foreground">
            Análisis impulsado por IA para optimizar tu negocio
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

      {/* Business Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Score General del Negocio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold">{businessScore}/100</div>
            <Badge variant={businessScore > 80 ? "default" : businessScore > 60 ? "secondary" : "destructive"}>
              {businessScore > 80 ? "Excelente" : businessScore > 60 ? "Bueno" : "Necesita Mejora"}
            </Badge>
          </div>
          <Progress value={businessScore} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            Basado en métricas de rendimiento, cumplimiento y eficiencia
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Margen de Ganancia</p>
                  <p className="text-2xl font-bold">{metrics.profitMargin.toFixed(1)}%</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                  <p className="text-2xl font-bold">{metrics.avgDeliveryTime.toFixed(1)}h</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cumplimiento</p>
                  <p className="text-2xl font-bold">{metrics.complianceScore.toFixed(0)}%</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Eficiencia</p>
                  <p className="text-2xl font-bold">{metrics.fuelEfficiency.toFixed(1)} km/l</p>
                </div>
                <Fuel className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* High Priority Insights */}
      {highPriorityInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Insights de Alta Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highPriorityInsights.map((insight) => (
                <Alert key={insight.id} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{insight.title}</strong>
                        <p className="mt-1">{insight.description}</p>
                        <p className="text-sm mt-2 font-medium">💡 {insight.recommendation}</p>
                      </div>
                      <Badge variant={getImpactColor(insight.impact)}>
                        {insight.impact}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predicciones</TabsTrigger>
          <TabsTrigger value="compliance">Cumplimiento</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Insights de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceInsights.map((insight) => (
                    <div key={insight.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(insight.trend)}
                        <div>
                          <p className="font-medium">{insight.title}</p>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                      <Badge variant={getImpactColor(insight.impact)}>
                        {insight.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Insights de Eficiencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {efficiencyInsights.map((insight) => (
                    <div key={insight.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(insight.trend)}
                        <div>
                          <p className="font-medium">{insight.title}</p>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                      <Badge variant={getImpactColor(insight.impact)}>
                        {insight.value.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {predictions && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendencias Estacionales</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Factores de Riesgo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictions.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{risk.factor}</p>
                          <p className="text-sm text-muted-foreground">{risk.impact}</p>
                        </div>
                        <Badge variant={risk.probability > 0.7 ? "destructive" : risk.probability > 0.4 ? "default" : "secondary"}>
                          {(risk.probability * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {compliance && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Cumplimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={complianceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {complianceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Issues de Cumplimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {compliance.issues.map((issue, index) => (
                      <Alert key={index} variant={issue.type === 'critical' ? "destructive" : "default"}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-medium">{issue.description}</p>
                          <p className="text-sm mt-1">💡 {issue.solution}</p>
                          <Badge className="mt-2" variant={issue.type === 'critical' ? "destructive" : "default"}>
                            Prioridad: {issue.priority}/10
                          </Badge>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
                
                {recommendations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>¡Excelente! No hay recomendaciones críticas en este momento.</p>
                    <p className="text-sm">Tu negocio está funcionando eficientemente.</p>
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
