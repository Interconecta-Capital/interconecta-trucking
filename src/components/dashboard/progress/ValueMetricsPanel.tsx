
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Shield, 
  DollarSign, 
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import { ValueMetrics } from '@/hooks/usePersonalProgress';

interface ValueMetricsPanelProps {
  metrics: ValueMetrics;
}

export function ValueMetricsPanel({ metrics }: ValueMetricsPanelProps) {
  const mainMetrics = [
    {
      title: 'Tiempo Ahorrado',
      value: `${metrics.tiempoAhorrado}h`,
      subtitle: 'vs. proceso manual',
      icon: Clock,
      color: 'text-green-600',
      bg: 'bg-green-100',
      trend: '+23%',
      description: 'Tiempo que habrías perdido sin InterConecta'
    },
    {
      title: 'Errores SAT Evitados',
      value: metrics.erroresEvitados.toString(),
      subtitle: 'validaciones automáticas',
      icon: Shield,
      color: 'text-red-600',
      bg: 'bg-red-100',
      trend: '+15%',
      description: 'Errores detectados y corregidos antes del timbrado'
    },
    {
      title: 'Dinero Ahorrado',
      value: `$${(metrics.dineroAhorrado / 1000).toFixed(0)}K`,
      subtitle: 'en multas evitadas',
      icon: DollarSign,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      trend: '+31%',
      description: 'Costo promedio de multas y rechazos evitados'
    },
    {
      title: 'Eficiencia Global',
      value: `${metrics.eficienciaPromedio}%`,
      subtitle: 'tasa de éxito',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      trend: '+8%',
      description: 'Porcentaje de cartas porte procesadas sin errores'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">💰 Centro de Valor Personalizado</h3>
        <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
          ROI Comprobado
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${metric.bg}`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                    {metric.trend}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-gray-500">{metric.subtitle}</p>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Métrica destacada del ROI */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-green-800 mb-2">
                🎯 Tu ROI con InterConecta
              </h4>
              <p className="text-green-700">
                Por cada peso invertido en la plataforma, has ahorrado{' '}
                <span className="font-bold text-2xl text-green-800">
                  ${Math.round(metrics.dineroAhorrado / 1000)}
                </span>{' '}
                pesos en costos evitados.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl">📈</div>
              <Badge className="bg-green-600 text-white mt-2">
                ROI: +{Math.round(metrics.dineroAhorrado / 1000)}00%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
