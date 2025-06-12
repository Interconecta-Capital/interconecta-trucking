
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
    <div className="space-y-6">
      {/* Métricas de rendimiento */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {metric.label}
                </span>
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <Progress value={metric.value} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{metric.value}%</span>
                  <span>Meta: {metric.target}%</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top rutas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Rutas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topRoutes.map((ruta, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {ruta.ruta}
                </p>
                <p className="text-xs text-gray-600">
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
