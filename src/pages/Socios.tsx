
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Building,
  TrendingUp,
  Calendar,
  DollarSign
} from "lucide-react";

const Socios = () => {
  const socios = [
    {
      id: "1",
      nombre: "Distribuidora Central S.A. de C.V.",
      contacto: "Roberto Mendoza",
      telefono: "+52 55 9876 5432",
      email: "roberto@distribuidora.com",
      direccion: "Av. Insurgentes Sur 1234, CDMX",
      rfc: "DCE120101ABC",
      tipo: "Cliente Premium",
      tipoColor: "bg-purple-100 text-purple-800",
      viajes: 45,
      facturacion: "$2,340,500",
      ultimoViaje: "2024-01-15",
      rating: 4.8,
      status: "Activo"
    },
    {
      id: "2",
      nombre: "Comercial del Norte S.A.",
      contacto: "Patricia Silva",
      telefono: "+52 81 5555 1234",
      email: "patricia@comercialnorte.com",
      direccion: "Blvd. Díaz Ordaz 567, Monterrey, N.L.",
      rfc: "CDN890505DEF",
      tipo: "Cliente Regular",
      tipoColor: "bg-blue-100 text-blue-800",
      viajes: 23,
      facturacion: "$890,200",
      ultimoViaje: "2024-01-12",
      rating: 4.5,
      status: "Activo"
    },
    {
      id: "3",
      nombre: "Turística del Caribe S.A.",
      contacto: "Miguel Herrera",
      telefono: "+52 998 7777 8888",
      email: "miguel@turisticacaribe.com",
      direccion: "Zona Hotelera Km 12, Cancún, Q.R.",
      rfc: "TDC031225GHI",
      tipo: "Cliente Estacional",
      tipoColor: "bg-green-100 text-green-800",
      viajes: 18,
      facturacion: "$650,800",
      ultimoViaje: "2024-01-08",
      rating: 4.2,
      status: "Activo"
    },
    {
      id: "4",
      nombre: "Industrial Bajío S.A.",
      contacto: "Fernando Castro",
      telefono: "+52 477 3333 4444",
      email: "fernando@industrialbajio.com",
      direccion: "Parque Industrial Norte, León, GTO",
      rfc: "IBJ150815JKL",
      tipo: "Cliente Nuevo",
      tipoColor: "bg-yellow-100 text-yellow-800",
      viajes: 5,
      facturacion: "$125,000",
      ultimoViaje: "2024-01-05",
      rating: 4.0,
      status: "En Evaluación"
    }
  ];

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getRatingStars = (rating: number) => {
    return "⭐".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "⭐" : "");
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Socios Comerciales</h1>
                <p className="text-gray-600">Gestiona tus clientes y socios estratégicos</p>
              </div>
            </div>
            <Button className="bg-trucking-orange-500 hover:bg-trucking-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Socio
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
                      placeholder="Buscar por nombre, RFC, contacto..." 
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">156</div>
                  <div className="text-sm text-gray-600">Total Socios</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">142</div>
                  <div className="text-sm text-gray-600">Activos</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">28</div>
                  <div className="text-sm text-gray-600">Premium</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-trucking-orange-600">$5.2M</div>
                  <div className="text-sm text-gray-600">Facturación</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Socios Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {socios.map((socio) => (
              <Card key={socio.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-trucking-blue-100 text-trucking-blue-600 font-semibold">
                          {getInitials(socio.nombre)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{socio.nombre}</CardTitle>
                        <p className="text-sm text-gray-600">{socio.contacto}</p>
                        <p className="text-xs text-gray-500">{socio.rfc}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={socio.tipoColor}>
                        {socio.tipo}
                      </Badge>
                      <div className="text-xs text-gray-600">
                        {getRatingStars(socio.rating)} {socio.rating}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{socio.telefono}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{socio.email}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{socio.direccion}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-trucking-blue-600">{socio.viajes}</div>
                        <div className="text-xs text-gray-600">Viajes</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-green-600">{socio.facturacion}</div>
                        <div className="text-xs text-gray-600">Facturación</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{socio.ultimoViaje}</div>
                        <div className="text-xs text-gray-600">Último Viaje</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Building className="h-3 w-3 mr-1" />
                      Ver Perfil
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Historial
                    </Button>
                    <Button size="sm" className="bg-trucking-orange-500 hover:bg-trucking-orange-600 text-white">
                      <Plus className="h-3 w-3 mr-1" />
                      Cotizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Socios;
