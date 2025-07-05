
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Truck, 
  Route,
  Calendar,
  DollarSign,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardNavigation() {
  const dashboards = [
    {
      title: 'Dashboard Principal',
      description: 'Vista general de operaciones',
      icon: BarChart3,
      href: '/',
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
      href: '/operadores-avanzados',
      color: 'bg-purple-500'
    },
    {
      title: 'Análisis de Flota',
      description: 'Performance de vehículos',
      icon: Truck,
      href: '/flota',
      color: 'bg-orange-500'
    },
    {
      title: 'Optimización de Rutas',
      description: 'Análisis de rentabilidad por ruta',
      icon: Route,
      href: '/rutas',
      color: 'bg-indigo-500'
    },
    {
      title: 'Planificación',
      description: 'Calendario y programación',
      icon: Calendar,
      href: '/planificacion',
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Centro de Control</h1>
        <p className="text-gray-600 mt-2">
          Accede a todos los dashboards y herramientas de análisis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.href} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${dashboard.color}`}>
                  <dashboard.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{dashboard.description}</p>
              <Link to={dashboard.href}>
                <Button className="w-full">
                  Acceder
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">$125,430</div>
                <div className="text-sm text-gray-600">Ingresos del mes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">18.5%</div>
                <div className="text-sm text-gray-600">Margen promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Route className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">247</div>
                <div className="text-sm text-gray-600">Viajes completados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">85%</div>
                <div className="text-sm text-gray-600">Utilización flota</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
