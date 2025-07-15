
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
  Download,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardCounts } from '@/hooks/useDashboardCounts';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';

export default function DashboardHub() {
  const { data: counts } = useDashboardCounts();
  const permissions = useUnifiedPermissionsV2();

  const dashboards = [
    {
      title: 'Dashboard Principal',
      description: 'Métricas generales y KPIs básicos',
      icon: BarChart3,
      href: '/dashboard/principal',
      color: 'bg-blue-500',
      stats: `${counts?.viajes || 0} viajes este mes`,
      status: 'Activo'
    },
    {
      title: 'Dashboard Ejecutivo',
      description: 'Análisis de rentabilidad avanzado',
      icon: TrendingUp,
      href: '/dashboard-ejecutivo',
      color: 'bg-green-500',
      stats: 'Margen promedio: 18.5%',
      status: 'Nuevo'
    },
    {
      title: 'Gestión de Operadores',
      description: 'Performance y métricas de conductores',
      icon: Users,
      href: '/dashboard/operadores',
      color: 'bg-purple-500',
      stats: `${counts?.conductores || 0} conductores activos`,
      status: 'Activo'
    },
    {
      title: 'Analytics de Viajes',
      description: 'Análisis detallado de operaciones',
      icon: Route,
      href: '/viajes/analytics',
      color: 'bg-indigo-500',
      stats: 'Última actualización: hace 2 min',
      status: 'Activo'
    },
    {
      title: 'Análisis de Flota',
      description: 'Performance de vehículos',
      icon: Truck,
      href: '/dashboard/flota',
      color: 'bg-orange-500',
      stats: `${counts?.vehiculos || 0} vehículos`,
      status: 'Próximamente'
    },
    {
      title: 'Reportes Automáticos',
      description: 'Configuración avanzada de reportes programados',
      icon: Calendar,
      href: '/dashboard/reportes-automaticos',
      color: 'bg-gradient-to-r from-teal-500 to-blue-500',
      stats: '3 reportes activos',
      status: 'Activo'
    }
  ];

  const quickMetrics = [
    {
      title: 'Ingresos del Mes',
      value: '$125,430',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Margen Promedio',
      value: '18.5%',
      change: '+2.1%',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Viajes Completados',
      value: counts?.viajes?.toString() || '0',
      change: '+15.3%',
      icon: Route,
      color: 'text-purple-600'
    },
    {
      title: 'Utilización Flota',
      value: '85%',
      change: '+5.2%',
      icon: Truck,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Control</h1>
          <p className="text-gray-600 mt-2">
            Panel unificado de análisis y reportes empresariales
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/reportes">
            <Button variant="outline" size="sm" className="hover-scale">
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </Button>
          </Link>
          <Link to="/dashboard/reportes">
            <Button size="sm" className="bg-gradient-primary hover:bg-gradient-primary-hover">
              <Clock className="h-4 w-4 mr-2" />
              Programar Reporte
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickMetrics.map((metric) => (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <span className={`text-sm font-medium ${metric.color}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboards Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboards Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <Card key={dashboard.href} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
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
                          dashboard.status === 'Nuevo' ? 'default' :
                          dashboard.status === 'Beta' ? 'secondary' :
                          dashboard.status === 'Próximamente' ? 'outline' : 'secondary'
                        }
                        className="mt-1"
                      >
                        {dashboard.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{dashboard.description}</p>
                <p className="text-sm text-gray-500 mb-4">{dashboard.stats}</p>
                
                {dashboard.status !== 'Próximamente' ? (
                  <Link to={dashboard.href}>
                    <Button className="w-full group">
                      Acceder
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full">
                    Próximamente
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Nuevo reporte de rentabilidad generado</p>
                <p className="text-sm text-gray-600">Análisis mensual completado - hace 10 min</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Route className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Optimización de rutas completada</p>
                <p className="text-sm text-gray-600">12 rutas analizadas - hace 1 hora</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Evaluación de conductores actualizada</p>
                <p className="text-sm text-gray-600">Performance mensual calculada - hace 2 horas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
