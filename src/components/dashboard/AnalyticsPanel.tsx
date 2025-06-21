
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';
import { TrendingUp, TrendingDown, BarChart3, MapPin } from 'lucide-react';

export function AnalyticsPanel() {
  const metrics = [
    {
      label: 'Entregas a tiempo',
      value: 92,
      target: 95,
      trend: 'up',
      change: '+3%',
    },
    {
      label: 'Eficiencia combustible',
      value: 78,
      target: 85,
      trend: 'down',
      change: '-1%',
    },
    {
      label: 'Rutas optimizadas',
      value: 85,
      target: 90,
      trend: 'up',
      change: '+5%',
    },
  ];

  const topRoutes = [
    { ruta: 'CDMX - Guadalajara', viajes: 15, eficiencia: 94 },
    { ruta: 'Monterrey - Tijuana', viajes: 12, eficiencia: 89 },
    { ruta: 'Puebla - Cancún', viajes: 8, eficiencia: 91 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Métricas de rendimiento */}
      <Card>
        <CardHeader className="pb-4">
          <SectionHeader
            title="Rendimiento"
            icon={BarChart3}
            className="border-0 pb-0"
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-70">
                  {metric.label}
                </span>
                <div className="flex items-center gap-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress value={metric.value} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-60">{metric.value}%</span>
                  <span className="text-gray-60">Meta: {metric.target}%</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top rutas */}
      <Card>
        <CardHeader className="pb-4">
          <SectionHeader
            title="Top Rutas"
            icon={MapPin}
            className="border-0 pb-0"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {topRoutes.map((ruta, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-05 hover:bg-gray-10 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-90">
                  {ruta.ruta}
                </p>
                <p className="text-xs text-gray-60 mt-1">
                  {ruta.viajes} viajes este mes
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={`${
                  ruta.eficiencia >= 90 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-orange-50 text-orange-700 border-orange-200'
                }`}
              >
                {ruta.eficiencia}%
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
