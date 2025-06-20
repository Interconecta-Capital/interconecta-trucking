
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Shield, 
  Award, 
  TrendingUp, 
  Target,
  Lightbulb,
  DollarSign,
  CheckCircle,
  Zap,
  Star,
  Activity
} from 'lucide-react';
import { usePersonalProgress } from '@/hooks/usePersonalProgress';
import { ValueMetricsPanel } from './progress/ValueMetricsPanel';
import { GamificationPanel } from './progress/GamificationPanel';
import { InsightsPanel } from './progress/InsightsPanel';
import { ProgressChart } from './progress/ProgressChart';

export function PersonalProgressDashboard() {
  const { 
    progressData, 
    achievements, 
    insights, 
    valueMetrics,
    isLoading 
  } = usePersonalProgress();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary rounded-apple" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de bienvenida personalizada */}
      <Card className="bg-gradient-to-r from-blue-primary to-purple-primary text-inverse">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">
                Tu Progreso es Excepcional
              </CardTitle>
              <p className="text-blue-light">
                Has ahorrado <span className="font-bold text-yellow-primary">
                  {valueMetrics.tiempoAhorrado} horas
                </span> y evitado <span className="font-bold text-yellow-primary">
                  {valueMetrics.erroresEvitados} errores SAT
                </span> este mes
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${valueMetrics.dineroAhorrado.toLocaleString()}</div>
              <div className="text-sm text-blue-light">Ahorrado en multas evitadas</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Panel de Métricas de Valor - Prioridad #1 */}
      <ValueMetricsPanel metrics={valueMetrics} />

      {/* Gráfico de progreso temporal */}
      <ProgressChart data={progressData} />

      {/* Grid de Gamificación e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GamificationPanel achievements={achievements} />
        <InsightsPanel insights={insights} />
      </div>

      {/* Resumen de actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-primary" />
            Actividad Reciente de Valor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progressData.actividadReciente?.map((actividad, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-apple">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    actividad.tipo === 'ahorro' ? 'bg-green-light text-green-primary' :
                    actividad.tipo === 'error_evitado' ? 'bg-red-light text-red-primary' :
                    'bg-blue-light text-blue-primary'
                  }`}>
                    {actividad.tipo === 'ahorro' ? <Clock className="h-4 w-4" /> :
                     actividad.tipo === 'error_evitado' ? <Shield className="h-4 w-4" /> :
                     <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{actividad.descripcion}</p>
                    <p className="text-sm text-secondary">{actividad.fecha}</p>
                  </div>
                </div>
                <Badge variant="outline" className="font-semibold">
                  {actividad.valor}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
