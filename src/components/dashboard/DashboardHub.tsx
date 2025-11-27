import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Truck, 
  Route,
  Calendar,
  DollarSign,
  Target,
  ArrowRight,
  Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDashboardCounts } from '@/hooks/useDashboardCounts';
import { useRealDashboardMetrics } from '@/hooks/useRealDashboardMetrics';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { useSuperuser } from '@/hooks/useSuperuser';
import { IntegrityMonitorPanel } from './IntegrityMonitorPanel';

export default function DashboardHub() {
  const navigate = useNavigate();
  const { data: counts } = useDashboardCounts();
  const { data: metrics, isLoading: metricsLoading } = useRealDashboardMetrics();
  const permissions = useUnifiedPermissionsV2();
  const { isSuperuser } = useSuperuser();

  // Determinar nivel de plan para control de acceso
  const planLevel = (permissions as any).planDetails?.nombre || (permissions as any).plan?.nombre || 'gratuito';
  const isPlanFlotaOrHigher = ['Plan Flota', 'Plan Business', 'flota', 'business'].some(
    p => planLevel.toLowerCase().includes(p.toLowerCase())
  ) || isSuperuser;
  const isPlanOperadorOrHigher = isPlanFlotaOrHigher || ['Plan Operador', 'operador'].some(
    p => planLevel.toLowerCase().includes(p.toLowerCase())
  );

  const dashboards = [
    {
      title: 'Dashboard Principal',
      description: 'Métricas generales y KPIs básicos',
      icon: BarChart3,
      href: '/dashboard/principal',
      color: 'bg-blue-500',
      stats: `${counts?.viajes || 0} viajes este mes`,
      status: 'Activo',
      requiredPlan: 'gratuito',
      hasAccess: true
    },
    {
      title: 'Dashboard Ejecutivo',
      description: 'Análisis de rentabilidad avanzado',
      icon: TrendingUp,
      href: '/dashboard-ejecutivo',
      color: 'bg-green-500',
      stats: 'Análisis de márgenes y costos',
      status: isPlanFlotaOrHigher ? 'Activo' : 'Plan Flota',
      requiredPlan: 'flota',
      hasAccess: isPlanFlotaOrHigher
    },
    {
      title: 'Gestión de Operadores',
      description: 'Performance y métricas de conductores',
      icon: Users,
      href: '/dashboard/operadores',
      color: 'bg-purple-500',
      stats: `${counts?.conductores || 0} conductores activos`,
      status: isPlanOperadorOrHigher ? 'Activo' : 'Plan Operador',
      requiredPlan: 'operador',
      hasAccess: isPlanOperadorOrHigher
    },
    {
      title: 'Analytics de Viajes',
      description: 'Análisis detallado de operaciones',
      icon: Route,
      href: '/viajes/analytics',
      color: 'bg-indigo-500',
      stats: 'Estadísticas de viajes',
      status: isPlanOperadorOrHigher ? 'Activo' : 'Plan Operador',
      requiredPlan: 'operador',
      hasAccess: isPlanOperadorOrHigher
    },
    {
      title: 'Análisis de Flota',
      description: 'Performance de vehículos',
      icon: Truck,
      href: '/dashboard/flota',
      color: 'bg-orange-500',
      stats: `${counts?.vehiculos || 0} vehículos`,
      status: 'Próximamente',
      requiredPlan: 'flota',
      hasAccess: false
    },
    {
      title: 'Reportes Automáticos',
      description: 'Configuración avanzada de reportes programados',
      icon: Calendar,
      href: '/dashboard/reportes-automaticos',
      color: 'bg-gradient-to-r from-teal-500 to-blue-500',
      stats: 'Reportes programados',
      status: 'Próximamente',
      requiredPlan: 'flota',
      hasAccess: false
    }
  ];

  const quickMetrics = [
    {
      title: 'Ingresos del Mes',
      value: metricsLoading ? '...' : metrics?.ingresosDelMes ? `$${metrics.ingresosDelMes.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00',
      change: metrics?.ingresosComparacion || '-',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Margen Promedio',
      value: metricsLoading ? '...' : metrics?.margenPromedio ? `${metrics.margenPromedio.toFixed(1)}%` : '-',
      change: metrics?.margenComparacion || '-',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Viajes Completados',
      value: metricsLoading ? '...' : metrics?.viajesCompletados?.toString() || '0',
      change: metrics?.viajesComparacion || '-',
      icon: Route,
      color: 'text-purple-600'
    },
    {
      title: 'Utilización Flota',
      value: metricsLoading ? '...' : metrics?.utilizacionFlota ? `${metrics.utilizacionFlota.toFixed(0)}%` : '-',
      change: metrics?.utilizacionComparacion || '-',
      icon: Truck,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centro de Control</h1>
          <p className="text-muted-foreground mt-2">
            Panel unificado de análisis y reportes empresariales
          </p>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {quickMetrics.map((metric) => (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    {metric.change !== '-' && (
                      <span className={`text-sm font-medium ${metric.color}`}>
                        {metric.change}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboards Grid */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Dashboards Disponibles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {dashboards.map((dashboard) => (
            <Card 
              key={dashboard.href} 
              className={`transition-all duration-200 ${
                dashboard.hasAccess 
                  ? 'hover:shadow-lg hover:-translate-y-1' 
                  : 'opacity-75'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${dashboard.color}`}>
                      <dashboard.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                      <Badge 
                        variant={
                          dashboard.status === 'Activo' ? 'default' :
                          dashboard.status === 'Próximamente' ? 'outline' : 'secondary'
                        }
                        className="mt-1"
                      >
                        {!dashboard.hasAccess && dashboard.status !== 'Próximamente' && (
                          <Lock className="h-3 w-3 mr-1" />
                        )}
                        {dashboard.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{dashboard.description}</p>
                <p className="text-sm text-muted-foreground mb-4">{dashboard.stats}</p>
                
                {dashboard.hasAccess && dashboard.status === 'Activo' ? (
                  <Link to={dashboard.href}>
                    <Button className="w-full group">
                      Acceder
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : dashboard.status === 'Próximamente' ? (
                  <Button disabled className="w-full">
                    Próximamente
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/planes')}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Requiere {dashboard.status}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Monitor de Integridad - Solo para Superusuarios */}
      {isSuperuser && <IntegrityMonitorPanel />}
    </div>
  );
}
