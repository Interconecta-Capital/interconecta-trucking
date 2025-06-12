
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  RefreshCw,
  BrainCircuit,
  AlertTriangle,
  BarChart3,
  Truck,
  Package
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SimpleCalendarView } from "@/components/dashboard/SimpleCalendarView";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";

const Dashboard = () => {
  const { 
    metrics, 
    isLoading
  } = useAnalytics();

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar />
      <main className="flex-1 w-full">
        <GlobalHeader />

        <div className="p-6 space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Viajes Activos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : metrics?.activeTrips || 12}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Truck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-green-700 bg-green-50">
                    +2 desde ayer
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entregas Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : metrics?.todayDeliveries || 8}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-blue-700 bg-blue-50">
                    75% completado
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Alertas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : 5}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-orange-700 bg-orange-50">
                    2 urgentes
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Eficiencia</p>
                    <p className="text-2xl font-bold text-gray-900">94%</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-purple-700 bg-purple-50">
                    +3% vs mes anterior
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botones de análisis IA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              className="h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
            >
              <BrainCircuit className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Analizar Viajes con IA</div>
                <div className="text-sm opacity-90">Optimiza rutas y tiempos con Gemini</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-16 border-orange-300 hover:bg-orange-50"
              size="lg"
            >
              <AlertTriangle className="h-6 w-6 mr-2 text-orange-600" />
              <div className="text-left">
                <div className="font-semibold">Analizar Alertas</div>
                <div className="text-sm text-gray-600">Revisa incidencias y problemas</div>
              </div>
            </Button>
          </div>

          {/* Calendario y Panel lateral */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendario principal */}
            <div className="lg:col-span-3">
              <SimpleCalendarView />
            </div>

            {/* Panel lateral */}
            <div className="space-y-6">
              <NotificationsPanel />
              <AnalyticsPanel />
              
              {/* Acciones rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/cartas-porte">
                    <Button className="w-full justify-start bg-trucking-blue-500 hover:bg-trucking-blue-600 text-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Carta Porte
                    </Button>
                  </Link>
                  <Link to="/conductores">
                    <Button variant="outline" className="w-full justify-start text-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Conductor
                    </Button>
                  </Link>
                  <Link to="/vehiculos">
                    <Button variant="outline" className="w-full justify-start text-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Vehículo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
