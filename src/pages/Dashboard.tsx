
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Truck, 
  Users, 
  TrendingUp, 
  Plus,
  Calendar,
  MapPin,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const stats = [
    {
      title: "Cartas Porte Activas",
      value: "127",
      change: "+12%",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Vehículos en Ruta",
      value: "23",
      change: "+5%",
      icon: Truck,
      color: "text-green-600"
    },
    {
      title: "Conductores Activos",
      value: "45",
      change: "+8%",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Ingresos del Mes",
      value: "$2,340,500",
      change: "+15%",
      icon: DollarSign,
      color: "text-orange-600"
    }
  ];

  const recentDeliveries = [
    {
      id: "CP-2024-001",
      origin: "CDMX",
      destination: "Guadalajara",
      driver: "Juan Pérez",
      status: "En tránsito",
      statusColor: "bg-yellow-100 text-yellow-800"
    },
    {
      id: "CP-2024-002",
      origin: "Monterrey",
      destination: "Tijuana",
      driver: "María García",
      status: "Entregado",
      statusColor: "bg-green-100 text-green-800"
    },
    {
      id: "CP-2024-003",
      origin: "Puebla",
      destination: "Cancún",
      driver: "Carlos López",
      status: "Pendiente",
      statusColor: "bg-gray-100 text-gray-800"
    }
  ];

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar />
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Bienvenido de nuevo, administrador</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button className="bg-trucking-orange-500 hover:bg-trucking-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Carta Porte
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-green-600 font-medium">
                    {stat.change} vs mes anterior
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Deliveries */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Entregas Recientes</CardTitle>
                    <Link to="/cartas-porte">
                      <Button variant="outline" size="sm">Ver todas</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentDeliveries.map((delivery) => (
                      <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="bg-trucking-blue-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-trucking-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{delivery.id}</p>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-3 w-3 mr-1" />
                              {delivery.origin} → {delivery.destination}
                            </div>
                            <p className="text-sm text-gray-600">Conductor: {delivery.driver}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${delivery.statusColor}`}>
                          {delivery.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/cartas-porte">
                    <Button className="w-full justify-start bg-trucking-blue-500 hover:bg-trucking-blue-600">
                      <FileText className="h-4 w-4 mr-2" />
                      Nueva Carta Porte
                    </Button>
                  </Link>
                  <Link to="/conductores">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Agregar Conductor
                    </Button>
                  </Link>
                  <Link to="/vehiculos">
                    <Button variant="outline" className="w-full justify-start">
                      <Truck className="h-4 w-4 mr-2" />
                      Registrar Vehículo
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Próximos Vencimientos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-800">Licencia - Juan Pérez</p>
                        <p className="text-sm text-yellow-600">Vence en 15 días</p>
                      </div>
                      <Calendar className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium text-red-800">Verificación - ABC-123</p>
                        <p className="text-sm text-red-600">Vence en 3 días</p>
                      </div>
                      <Calendar className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
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
