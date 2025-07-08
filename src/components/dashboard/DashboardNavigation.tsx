
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
  ArrowLeft,
  Home,
  FileText
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
      href: '/dashboard/viajes/analytics',
      color: 'bg-indigo-500'
    },
    {
      title: 'Reportes Programados',
      description: 'Configuración de reportes automáticos',
      icon: FileText,
      href: '/dashboard/reportes',
      color: 'bg-teal-500'
    },
    {
      title: 'Análisis de Flota',
      description: 'Performance de vehículos',
      icon: Truck,
      href: '/dashboard/flota',
      color: 'bg-orange-500'
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
    </div>
  );
}
