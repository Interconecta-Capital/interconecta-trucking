import { AppSidebar } from "@/components/AppSidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
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
  Calendar,
  MapPin,
  AlertTriangle
} from "lucide-react";

const Conductores = () => {
  const conductores = [
    {
      id: "1",
      nombre: "Juan Pérez Martínez",
      telefono: "+52 55 1234 5678",
      email: "juan.perez@email.com",
      licencia: "12345678901",
      fechaVencimiento: "2024-12-15",
      vehiculoAsignado: "ABC-123-45",
      viajes: 127,
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
      ubicacion: "En ruta - CDMX → Guadalajara",
      experiencia: "5 años"
    },
    {
      id: "2",
      nombre: "María García López",
      telefono: "+52 81 9876 5432",
      email: "maria.garcia@email.com",
      licencia: "98765432109",
      fechaVencimiento: "2025-03-22",
      vehiculoAsignado: "DEF-678-90",
      viajes: 89,
      status: "Disponible",
      statusColor: "bg-blue-100 text-blue-800",
      ubicacion: "Base Monterrey",
      experiencia: "3 años"
    },
    {
      id: "3",
      nombre: "Carlos López Hernández",
      telefono: "+52 33 5555 1234",
      email: "carlos.lopez@email.com",
      licencia: "11122233344",
      fechaVencimiento: "2024-02-10",
      vehiculoAsignado: "GHI-234-56",
      viajes: 203,
      status: "Documentos Vencidos",
      statusColor: "bg-red-100 text-red-800",
      ubicacion: "Base Guadalajara",
      experiencia: "8 años"
    },
    {
      id: "4",
      nombre: "Ana Rodríguez Flores",
      telefono: "+52 477 8888 9999",
      email: "ana.rodriguez@email.com",
      licencia: "55566677788",
      fechaVencimiento: "2025-08-30",
      vehiculoAsignado: "JKL-789-01",
      viajes: 156,
      status: "En Descanso",
      statusColor: "bg-yellow-100 text-yellow-800",
      ubicacion: "Base León",
      experiencia: "6 años"
    }
  ];

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const isLicenseExpiring = (fecha: string) => {
    const today = new Date();
    const expirationDate = new Date(fecha);
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 30;
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar />
      <main className="flex-1 w-full">
        <GlobalHeader />

        <div className="p-3 md:p-6">
          {/* Filters - Mobile optimized */}
          <Card className="mb-4 md:mb-6">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Buscar por nombre, licencia, teléfono..." 
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards - Mobile optimized grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-gray-900">45</div>
                  <div className="text-xs md:text-sm text-gray-600">Total Conductores</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-green-600">32</div>
                  <div className="text-xs md:text-sm text-gray-600">Activos</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-blue-600">8</div>
                  <div className="text-xs md:text-sm text-gray-600">Disponibles</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-red-600">5</div>
                  <div className="text-xs md:text-sm text-gray-600">Docs. Vencidos</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conductores Grid - Mobile optimized */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {conductores.map((conductor) => (
              <Card key={conductor.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                        <AvatarFallback className="bg-trucking-blue-100 text-trucking-blue-600 font-semibold text-xs md:text-sm">
                          {getInitials(conductor.nombre)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base md:text-lg truncate">{conductor.nombre}</CardTitle>
                        <p className="text-xs md:text-sm text-gray-600">{conductor.experiencia} de experiencia</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`${conductor.statusColor} text-xs`}>
                        {conductor.status}
                      </Badge>
                      {isLicenseExpiring(conductor.fechaVencimiento) && (
                        <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                    <div className="flex items-center min-w-0">
                      <Phone className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{conductor.telefono}</span>
                    </div>
                    <div className="flex items-center min-w-0">
                      <Mail className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{conductor.email}</span>
                    </div>
                    <div className="flex items-center min-w-0">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">Lic: {conductor.licencia}</span>
                    </div>
                    <div className="flex items-center min-w-0">
                      <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{conductor.vehiculoAsignado}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 md:pt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm text-gray-600">Ubicación actual</p>
                        <p className="font-medium text-sm md:text-base truncate">{conductor.ubicacion}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs md:text-sm text-gray-600">Viajes completados</p>
                        <p className="font-bold text-trucking-blue-600 text-sm md:text-base">{conductor.viajes}</p>
                      </div>
                    </div>
                  </div>

                  {isLicenseExpiring(conductor.fechaVencimiento) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-orange-500 mr-2 flex-shrink-0" />
                        <span className="text-xs md:text-sm text-orange-700">
                          Licencia vence el {conductor.fechaVencimiento}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Ver Perfil
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Asignar Viaje
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

export default Conductores;
