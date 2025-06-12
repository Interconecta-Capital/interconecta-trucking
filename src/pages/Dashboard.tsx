
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealtimeMetrics } from '@/components/dashboard/RealtimeMetrics';
import { SimpleCalendarView } from '@/components/dashboard/SimpleCalendarView';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Link } from 'react-router-dom';
import { Plus, FileText, Users, Truck, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { dashboardMetrics, realtimeMetrics, isLoadingDashboard, isLoadingRealtime } = useAnalytics();

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general de tus operaciones
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      <MetricsCards 
        metrics={dashboardMetrics || {
          cartasPorteActivas: 0,
          vehiculosEnRuta: 0,
          conductoresActivos: 0,
          ingresosMes: 0,
          cambioCartasPorte: 0,
          cambioVehiculos: 0,
          cambioConductores: 0,
          cambioIngresos: 0
        }} 
        isLoading={isLoadingDashboard} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Calendario - 2 columnas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Viajes</CardTitle>
              <CardDescription>
                Programa y visualiza tus entregas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleCalendarView />
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral con acciones rápidas y notificaciones */}
        <div className="space-y-4">
          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/cartas-porte" className="block">
                <Button 
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Carta Porte
                </Button>
              </Link>
              
              <Link to="/cartas-porte" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Documentos
                </Button>
              </Link>
              
              <Link to="/conductores" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Gestionar Conductores
                </Button>
              </Link>
              
              <Link to="/vehiculos" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Truck className="h-4 w-4 mr-2" />
                  Gestionar Vehículos
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reportes
              </Button>
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <NotificationsPanel />
        </div>
      </div>

      {/* Métricas en tiempo real */}
      <RealtimeMetrics 
        metrics={realtimeMetrics || {
          vehiculosActivos: 0,
          alertasActivas: 0,
          eficienciaPromedio: 0,
          consumoCombustible: 0,
          tiempoPromedioEntrega: 0,
          satisfaccionCliente: 0
        }}
        isLoading={isLoadingRealtime}
      />
    </div>
  );
}
