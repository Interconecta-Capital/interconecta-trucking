
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  MapPin,
  Calendar,
  User
} from "lucide-react";

const CartasPorte = () => {
  const cartasPorte = [
    {
      id: "CP-2024-001",
      folio: "A123456789",
      fecha: "2024-01-15",
      origen: "Ciudad de México, CDMX",
      destino: "Guadalajara, JAL",
      conductor: "Juan Pérez Martínez",
      vehiculo: "ABC-123-45",
      cliente: "Distribuidora Central S.A.",
      mercancia: "Electrodomésticos",
      peso: "15.5 ton",
      valor: "$125,000.00",
      status: "En tránsito",
      statusColor: "bg-yellow-100 text-yellow-800"
    },
    {
      id: "CP-2024-002",
      folio: "A123456790",
      fecha: "2024-01-14",
      origen: "Monterrey, N.L.",
      destino: "Tijuana, B.C.",
      conductor: "María García López",
      vehiculo: "DEF-678-90",
      cliente: "Comercial del Norte S.A.",
      mercancia: "Productos farmacéuticos",
      peso: "8.2 ton",
      valor: "$280,000.00",
      status: "Entregado",
      statusColor: "bg-green-100 text-green-800"
    },
    {
      id: "CP-2024-003",
      folio: "A123456791",
      fecha: "2024-01-13",
      origen: "Puebla, PUE",
      destino: "Cancún, Q.R.",
      conductor: "Carlos López Hernández",
      vehiculo: "GHI-234-56",
      cliente: "Turística del Caribe S.A.",
      mercancia: "Alimentos y bebidas",
      peso: "12.8 ton",
      valor: "$95,000.00",
      status: "Pendiente",
      statusColor: "bg-gray-100 text-gray-800"
    },
    {
      id: "CP-2024-004",
      folio: "A123456792",
      fecha: "2024-01-12",
      origen: "León, GTO",
      destino: "Mérida, YUC",
      conductor: "Ana Rodríguez Flores",
      vehiculo: "JKL-789-01",
      cliente: "Industrial Bajío S.A.",
      mercancia: "Calzado y textiles",
      peso: "6.5 ton",
      valor: "$65,000.00",
      status: "Cancelado",
      statusColor: "bg-red-100 text-red-800"
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
                <h1 className="text-2xl font-bold text-gray-900">Cartas Porte</h1>
                <p className="text-gray-600">Gestiona todas las cartas porte digitales</p>
              </div>
            </div>
            <Button className="bg-trucking-orange-500 hover:bg-trucking-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Carta Porte
            </Button>
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Buscar por folio, conductor, cliente..." 
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">127</div>
                  <div className="text-sm text-gray-600">Total Cartas</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">23</div>
                  <div className="text-sm text-gray-600">En Tránsito</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">89</div>
                  <div className="text-sm text-gray-600">Entregadas</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">15</div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cartas Porte List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Cartas Porte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartasPorte.map((carta) => (
                  <div key={carta.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{carta.folio}</h3>
                          <Badge className={carta.statusColor}>
                            {carta.status}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {carta.fecha}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {carta.origen} → {carta.destino}
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {carta.conductor}
                          </div>
                        </div>

                        <div className="mt-2 grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Cliente:</span>
                            <div className="font-medium">{carta.cliente}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Mercancía:</span>
                            <div className="font-medium">{carta.mercancia}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Peso:</span>
                            <div className="font-medium">{carta.peso}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Valor:</span>
                            <div className="font-medium text-green-600">{carta.valor}</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CartasPorte;
