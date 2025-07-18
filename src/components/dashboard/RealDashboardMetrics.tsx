
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useRealDashboard } from '@/hooks/useRealDashboard';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Route, 
  Truck,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function RealDashboardMetrics() {
  const { data: metrics, isLoading } = useRealDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
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

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const ingresosTrend = calculatePercentageChange(
    metrics.ingresosTotales, 
    metrics.comparativoPeriodoAnterior.ingresos
  );

  const viajesTrend = calculatePercentageChange(
    metrics.viajesCompletados,
    metrics.comparativoPeriodoAnterior.viajes
  );

  const margenTrend = calculatePercentageChange(
    metrics.margenPromedio,
    metrics.comparativoPeriodoAnterior.margen
  );

  const mainMetrics = [
    {
      title: 'Ingresos del Mes',
      value: formatCurrency(metrics.ingresosTotales),
      change: ingresosTrend,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Margen Promedio',
      value: `${metrics.margenPromedio.toFixed(1)}%`,
      change: margenTrend,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Viajes Completados',
      value: metrics.viajesCompletados.toString(),
      change: viajesTrend,
      icon: Route,
      color: 'text-purple-600'
    },
    {
      title: 'Eficiencia Flota',
      value: `${metrics.eficienciaFlota.toFixed(1)}%`,
      change: 0, // Se puede calcular comparativa
      icon: Truck,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainMetrics.map((metric, index) => {
          const isPositive = metric.change >= 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </div>
                {metric.change !== 0 && (
                  <div className="flex items-center text-xs">
                    <TrendIcon className={cn(
                      'h-3 w-3 mr-1',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )} />
                    <span className={cn(
                      'font-medium',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                    <span className="text-gray-600 ml-1">vs mes anterior</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Métricas operacionales detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Estado de viajes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado de Viajes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Completados</span>
              <span className="font-semibold text-green-600">
                {metrics.viajesCompletados}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">En Tránsito</span>
              <span className="font-semibold text-blue-600">
                {metrics.viajesEnTransito}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Programados</span>
              <span className="font-semibold text-orange-600">
                {metrics.viajesProgramados}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Utilización de recursos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recursos Activos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Vehículos Disponibles</span>
                <span>{metrics.vehiculosDisponibles}/{metrics.vehiculosActivos}</span>
              </div>
              <Progress 
                value={metrics.vehiculosActivos > 0 ? 
                  (metrics.vehiculosDisponibles / metrics.vehiculosActivos) * 100 : 0
                } 
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conductores Disponibles</span>
                <span>{metrics.conductoresDisponibles}/{metrics.conductoresActivos}</span>
              </div>
              <Progress 
                value={metrics.conductoresActivos > 0 ? 
                  (metrics.conductoresDisponibles / metrics.conductoresActivos) * 100 : 0
                } 
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumen financiero */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Ingresos Totales</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(metrics.ingresosTotales)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Costos Totales</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(metrics.costosTotales)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Margen Total</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(metrics.margenTotal)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rutas más rentables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-green-600" />
            Rutas Más Rentables
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.rutasMasRentables.length > 0 ? (
            <div className="space-y-3">
              {metrics.rutasMasRentables.map((ruta, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{ruta.origen} → {ruta.destino}</div>
                    <div className="text-sm text-gray-600">
                      {ruta.viajesTotal} viajes | 
                      {formatCurrency(ruta.ingresoPromedio)} promedio
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {ruta.margenPromedio.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">margen</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No hay datos suficientes para analizar rutas
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tendencias semanales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tendencias Semanales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.tendenciasSemanales.map((semana, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">Semana {semana.semana}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {formatCurrency(semana.ingresos)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {semana.viajes} viajes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
