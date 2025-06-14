
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Target, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Brain,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface AIMetrics {
  autocompleteUsage: {
    total: number;
    accuracy: number;
    timeSaved: number; // en minutos
  };
  validationResults: {
    total: number;
    errorsPreventados: number;
    accuracy: number;
  };
  userSatisfaction: {
    rating: number;
    totalRatings: number;
  };
  performance: {
    responseTime: number; // en ms
    uptime: number; // porcentaje
  };
}

export function AIDashboard() {
  const [metrics, setMetrics] = useState<AIMetrics>({
    autocompleteUsage: {
      total: 248,
      accuracy: 0.87,
      timeSaved: 45
    },
    validationResults: {
      total: 156,
      errorsPreventados: 23,
      accuracy: 0.92
    },
    userSatisfaction: {
      rating: 4.6,
      totalRatings: 89
    },
    performance: {
      responseTime: 1200,
      uptime: 99.8
    }
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      type: 'autocomplete',
      description: 'Dirección autocompletada en Guadalajara, JAL',
      confidence: 0.94,
      timestamp: '2 min ago'
    },
    {
      type: 'validation',
      description: 'Error detectado en peso vs descripción',
      confidence: 0.89,
      timestamp: '5 min ago'
    },
    {
      type: 'suggestion',
      description: 'Clave SAT sugerida para "Cemento Portland"',
      confidence: 0.96,
      timestamp: '8 min ago'
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'autocomplete':
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      case 'validation':
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case 'suggestion':
        return <Brain className="h-4 w-4 text-purple-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Dashboard de IA
          </h2>
          <p className="text-muted-foreground">
            Métricas y rendimiento del asistente inteligente
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 border-purple-200">
          <Sparkles className="h-3 w-3 mr-1" />
          Sistema Activo
        </Badge>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autocompletados</CardTitle>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.autocompleteUsage.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={metrics.autocompleteUsage.accuracy * 100} className="flex-1" />
              <span className="text-sm text-muted-foreground">
                {Math.round(metrics.autocompleteUsage.accuracy * 100)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.autocompleteUsage.timeSaved} min ahorrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validaciones</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.validationResults.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={metrics.validationResults.accuracy * 100} className="flex-1" />
              <span className="text-sm text-muted-foreground">
                {Math.round(metrics.validationResults.accuracy * 100)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.validationResults.errorsPreventados} errores prevenidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userSatisfaction.rating}/5</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={(metrics.userSatisfaction.rating / 5) * 100} className="flex-1" />
              <span className="text-sm text-muted-foreground">
                {metrics.userSatisfaction.totalRatings} votos
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Basado en calificaciones de usuarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.performance.responseTime}ms</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={metrics.performance.uptime} className="flex-1" />
              <span className="text-sm text-muted-foreground">
                {metrics.performance.uptime}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tiempo de respuesta promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente y estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas interacciones con el asistente de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConfidenceColor(activity.confidence)}`}
                      >
                        {Math.round(activity.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Tipos de Asistencia
            </CardTitle>
            <CardDescription>
              Distribución de funcionalidades utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Autocompletado de Direcciones</span>
                  <span>45%</span>
                </div>
                <Progress value={45} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sugerencias de Mercancías</span>
                  <span>32%</span>
                </div>
                <Progress value={32} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Validaciones Predictivas</span>
                  <span>18%</span>
                </div>
                <Progress value={18} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Extracción de Documentos</span>
                  <span>5%</span>
                </div>
                <Progress value={5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consejos y optimizaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Recomendaciones de IA
          </CardTitle>
          <CardDescription>
            Sugerencias para optimizar su uso del asistente inteligente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">📍 Direcciones</h4>
              <p className="text-sm text-muted-foreground">
                Use códigos postales para obtener sugerencias más precisas
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">📦 Mercancías</h4>
              <p className="text-sm text-muted-foreground">
                Incluya marca y modelo para mejor clasificación SAT
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">✅ Validaciones</h4>
              <p className="text-sm text-muted-foreground">
                Revise las sugerencias antes de guardar para mayor precisión
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">⚡ Rendimiento</h4>
              <p className="text-sm text-muted-foreground">
                El sistema aprende de sus patrones para mejorar sugerencias
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
