
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { 
  Activity, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  Truck,
  Route,
  AlertTriangle,
  Clock,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function RealTimeMetricsPanel() {
  const { data: metrics, isLoading } = useRealTimeMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Activity className="h-3 w-3 text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const realTimeCards = [
    {
      title: 'Viajes Hoy',
      value: metrics.viajesHoy,
      subtitle: `${metrics.viajesEnCurso} en curso`,
      icon: Route,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      comparison: {
        cambio: 5.2,
        valor: metrics.comparativas.viajesEnCurso
      },
      showAlert: metrics.viajesEnCurso > 10
    },
    {
      title: 'Ingresos Hoy',
      value: formatCurrency(metrics.ingresosHoy),
      subtitle: `Margen: ${formatCurrency(metrics.margenHoy)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      comparison: {
        cambio: 8.1,
        valor: metrics.comparativas.ingresosHoy
      },
      showAlert: metrics.ingresosHoy < 1000
    },
    {
      title: 'Recursos Activos',
      value: `${metrics.conductoresActivos}/${metrics.vehiculosEnUso}`,
      subtitle: 'Conductores/Vehículos',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      comparison: null,
      showAlert: metrics.conductoresActivos < 3
    },
    {
      title: 'Eficiencia Flota',
      value: `${metrics.eficienciaFlota.toFixed(1)}%`,
      subtitle: `Utilización: ${metrics.utilizacionRecursos.toFixed(1)}%`,
      icon: BarChart3,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      comparison: {
        cambio: 2.3,
        valor: metrics.comparativas.eficienciaFlota
      },
      showAlert: metrics.eficienciaFlota < 70
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header con timestamp */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Métricas en Tiempo Real</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Actualizado: {new Date().toLocaleTimeString('es-MX')}</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {realTimeCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={cn('p-2 rounded-lg', card.bg)}>
                  <Icon className={cn('h-4 w-4', card.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </div>
                  {card.showAlert && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mb-2">
                  {card.subtitle}
                </p>

                {card.comparison && (
                  <div className="flex items-center gap-1 text-xs">
                    {getTrendIcon(card.comparison.cambio)}
                    <span className={getTrendColor(card.comparison.cambio)}>
                      {Math.abs(card.comparison.cambio).toFixed(1)}%
                    </span>
                    <span className="text-gray-500">vs ayer</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Panel de alertas si hay documentos pendientes */}
      {metrics.documentosPendientes > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  {metrics.documentosPendientes} documentos pendientes
                </p>
                <p className="text-sm text-yellow-700">
                  Hay cartas porte en estado borrador que requieren atención
                </p>
              </div>
              <Badge variant="outline" className="ml-auto bg-yellow-100 text-yellow-800">
                {metrics.alertasUrgentes > 0 ? 'Urgente' : 'Pendiente'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
