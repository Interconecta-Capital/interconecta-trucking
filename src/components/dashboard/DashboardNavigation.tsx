
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Truck, 
  Route,
  Calendar,
  DollarSign,
  Target,
  ArrowLeft,
  Home
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function DashboardNavigation() {
  const location = useLocation();
  
  const dashboards = [
    {
      title: 'Centro de Control',
      description: 'Hub principal de dashboards',
      icon: Home,
      href: '/dashboard',
      color: 'bg-gray-500'
    },
    {
      title: 'Dashboard Principal',
      description: 'Vista general de operaciones',
      icon: BarChart3,
      href: '/dashboard/principal',
      color: 'bg-blue-500'
    },
    {
      title: 'Dashboard Ejecutivo',
      description: 'Análisis de rentabilidad avanzado',
      icon: TrendingUp,
      href: '/dashboard-ejecutivo',
      color: 'bg-green-500'
    },
    {
      title: 'Gestión de Operadores',
      description: 'Métricas y performance de conductores',
      icon: Users,
      href: '/dashboard/operadores',
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics de Viajes',
      description: 'Análisis detallado de viajes',
      icon: Route,
      href: '/viajes/analytics',
      color: 'bg-indigo-500'
    },
    {
      title: 'Análisis de Flota',
      description: 'Performance de vehículos',
      icon: Truck,
      href: '/dashboard/flota',
      color: 'bg-orange-500'
    },
    {
      title: 'Reportes',
      description: 'Configuración de reportes',
      icon: Calendar,
      href: '/dashboard/reportes',
      color: 'bg-teal-500'
    }
  ];

  const currentDashboard = dashboards.find(d => d.href === location.pathname);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
          Centro de Control
        </Link>
        {currentDashboard && currentDashboard.href !== '/dashboard' && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{currentDashboard.title}</span>
          </>
        )}
      </div>

      {/* Back to Hub Button */}
      {location.pathname !== '/dashboard' && (
        <Link to="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Centro de Control
          </Button>
        </Link>
      )}

      {/* Current Dashboard Info */}
      {currentDashboard && currentDashboard.href !== '/dashboard' && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentDashboard.color}`}>
                <currentDashboard.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{currentDashboard.title}</CardTitle>
                <p className="text-sm text-gray-600">{currentDashboard.description}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {dashboards.map((dashboard) => {
          const isActive = location.pathname === dashboard.href;
          return (
            <Link key={dashboard.href} to={dashboard.href}>
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="w-full h-auto p-3 flex flex-col items-center gap-2"
              >
                <dashboard.icon className="h-4 w-4" />
                <span className="text-xs text-center leading-tight">
                  {dashboard.title}
                </span>
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-lg font-bold text-blue-900">$125,430</div>
                <div className="text-xs text-blue-700">Ingresos del mes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-lg font-bold text-green-900">18.5%</div>
                <div className="text-xs text-green-700">Margen promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Route className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-lg font-bold text-purple-900">247</div>
                <div className="text-xs text-purple-700">Viajes completados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-lg font-bold text-orange-900">85%</div>
                <div className="text-xs text-orange-700">Utilización flota</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
