
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
  Truck,
  Fuel,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const Vehiculos = () => {
  const vehiculos = [
    {
      id: "1",
      placas: "ABC-123-45",
      marca: "Freightliner",
      modelo: "Cascadia",
      año: "2020",
      tipo: "Tractocamión",
      conductor: "Juan Pérez Martínez",
      status: "En Ruta",
      statusColor: "bg-blue-100 text-blue-800",
      ubicacion: "CDMX → Guadalajara",
      kilometraje: "245,380 km",
      ultimoMantenimiento: "2024-01-05",
      proximoMantenimiento: "2024-02-05",
      verificacion: "2024-08-15",
      seguro: "2024-12-30",
      combustible: "85%"
    },
    {
      id: "2",
      placas: "DEF-678-90",
      marca: "Volvo",
      modelo: "VNL 760",
      año: "2019",
      tipo: "Tractocamión",
      conductor: "María García López",
      status: "Disponible",
      statusColor: "bg-green-100 text-green-800",
      ubicacion: "Base Monterrey",
      kilometraje: "312,150 km",
      ultimoMantenimiento: "2024-01-10",
      proximoMantenimiento: "2024-02-10",
      verificacion: "2024-09-22",
      seguro: "2025-01-15",
      combustible: "92%"
    },
    {
      id: "3",
      placas: "GHI-234-56",
      marca: "Kenworth",
      modelo: "T680",
      año: "2021",
      tipo: "Tractocamión",
      conductor: "Carlos López Hernández",
      status: "Mantenimiento",
      statusColor: "bg-yellow-100 text-yellow-800",
      ubicacion: "Taller Central",
      kilometraje: "189,760 km",
      ultimoMantenimiento: "2024-01-15",
      proximoMantenimiento: "2024-01-20",
      verificacion: "2024-06-10",
      seguro: "2024-11-25",
      combustible: "15%"
    },
    {
      id: "4",
      placas: "JKL-789-01",
      marca: "Mercedes-Benz",
      modelo: "Actros",
      año: "2018",
      tipo: "Camión Rígido",
      conductor: "Ana Rodríguez Flores",
      status: "Fuera de Servicio",
      statusColor: "bg-red-100 text-red-800",
      ubicacion: "Base León",
      kilometraje: "420,890 km",
      ultimoMantenimiento: "2023-12-20",
      proximoMantenimiento: "Vencido",
      verificacion: "2024-03-05",
      seguro: "2024-02-10",
      combustible: "0%"
    }
  ];

  const isMaintenanceDue = (fecha: string) => {
    if (fecha === "Vencido") return true;
    const today = new Date();
    const maintenanceDate = new Date(fecha);
    const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilMaintenance <= 7;
  };

  const isDocumentExpiring = (fecha: string) => {
    const today = new Date();
    const expirationDate = new Date(fecha);
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 30;
  };

  const getFuelColor = (fuel: string) => {
    const percentage = parseInt(fuel);
    if (percentage <= 20) return "text-red-600";
    if (percentage <= 50) return "text-yellow-600";
    return "text-green-600";
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
                <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>
                <p className="text-gray-600">Gestiona tu flota de vehículos</p>
              </div>
            </div>
            <Button className="bg-trucking-orange-500 hover:bg-trucking-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Vehículo
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
                      placeholder="Buscar por placas, marca, conductor..." 
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
                  <div className="text-2xl font-bold text-gray-900">23</div>
                  <div className="text-sm text-gray-600">Total Vehículos</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">15</div>
                  <div className="text-sm text-gray-600">En Ruta</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">6</div>
                  <div className="text-sm text-gray-600">Disponibles</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">2</div>
                  <div className="text-sm text-gray-600">Mantenimiento</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vehículos Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vehiculos.map((vehiculo) => (
              <Card key={vehiculo.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-trucking-blue-100 p-3 rounded-lg">
                        <Truck className="h-6 w-6 text-trucking-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{vehiculo.placas}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {vehiculo.marca} {vehiculo.modelo} {vehiculo.año}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={vehiculo.statusColor}>
                        {vehiculo.status}
                      </Badge>
                      {(isMaintenanceDue(vehiculo.proximoMantenimiento) || 
                        isDocumentExpiring(vehiculo.verificacion) || 
                        isDocumentExpiring(vehiculo.seguro)) && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <div className="font-medium">{vehiculo.tipo}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Kilometraje:</span>
                      <div className="font-medium">{vehiculo.kilometraje}</div>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{vehiculo.conductor}</span>
                    </div>
                    <div className="flex items-center">
                      <Fuel className={`h-4 w-4 mr-2 ${getFuelColor(vehiculo.combustible)}`} />
                      <span className={getFuelColor(vehiculo.combustible)}>
                        {vehiculo.combustible}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ubicación:</span>
                        <span className="font-medium">{vehiculo.ubicacion}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Próximo Mantenimiento:</span>
                        <span className={`font-medium ${
                          isMaintenanceDue(vehiculo.proximoMantenimiento) 
                            ? 'text-red-600' 
                            : 'text-gray-900'
                        }`}>
                          {vehiculo.proximoMantenimiento}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document Status */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Estado de Documentos</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Verificación:</span>
                        {isDocumentExpiring(vehiculo.verificacion) ? (
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Seguro:</span>
                        {isDocumentExpiring(vehiculo.seguro) ? (
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {(isMaintenanceDue(vehiculo.proximoMantenimiento) || 
                    isDocumentExpiring(vehiculo.verificacion) || 
                    isDocumentExpiring(vehiculo.seguro)) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                        <span className="text-sm text-orange-700">
                          Requiere atención: documentos próximos a vencer
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Programar Mant.
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

export default Vehiculos;
