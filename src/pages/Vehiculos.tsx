import { AppSidebar } from "@/components/AppSidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Search,
  Filter,
  Truck,
  Calendar,
  AlertTriangle,
  Fuel,
  Wrench,
  MapPin
} from "lucide-react";

const Vehiculos = () => {
  const vehiculos = [
    {
      id: "1",
      placa: "ABC-123-45",
      marca: "Freightliner",
      modelo: "Cascadia",
      año: 2020,
      tipo: "Tractocamión",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
      conductor: "Juan Pérez",
      ubicacion: "En ruta - CDMX → Guadalajara",
      ultimoMantenimiento: "2024-01-10",
      proximoMantenimiento: "2024-04-10",
      kilometraje: 245000,
      combustible: 85
    },
    {
      id: "2", 
      placa: "DEF-678-90",
      marca: "Kenworth",
      modelo: "T680",
      año: 2019,
      tipo: "Tractocamión",
      status: "Disponible",
      statusColor: "bg-blue-100 text-blue-800",
      conductor: "No asignado",
      ubicacion: "Base Monterrey",
      ultimoMantenimiento: "2024-01-05",
      proximoMantenimiento: "2024-04-05",
      kilometraje: 198000,
      combustible: 92
    }
  ];

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar />
      <main className="flex-1 w-full">
        <GlobalHeader />

        <div className="p-3 md:p-6">
          {/* Filters */}
          <Card className="mb-4 md:mb-6">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Buscar por placa, marca, modelo..." 
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-gray-900">24</div>
                  <div className="text-xs md:text-sm text-gray-600">Total Vehículos</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-green-600">18</div>
                  <div className="text-xs md:text-sm text-gray-600">Activos</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-blue-600">6</div>
                  <div className="text-xs md:text-sm text-gray-600">Disponibles</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-orange-600">3</div>
                  <div className="text-xs md:text-sm text-gray-600">Mantenimiento</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vehiculos Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {vehiculos.map((vehiculo) => (
              <Card key={vehiculo.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-trucking-blue-100 p-3 rounded-lg">
                        <Truck className="h-6 w-6 text-trucking-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base md:text-lg">{vehiculo.placa}</CardTitle>
                        <p className="text-xs md:text-sm text-gray-600">
                          {vehiculo.marca} {vehiculo.modelo} {vehiculo.año}
                        </p>
                      </div>
                    </div>
                    <Badge className={vehiculo.statusColor}>
                      {vehiculo.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
                    <div>
                      <p className="text-gray-600">Conductor</p>
                      <p className="font-medium">{vehiculo.conductor}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tipo</p>
                      <p className="font-medium">{vehiculo.tipo}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs md:text-sm text-gray-600 mb-2">Ubicación actual</p>
                    <p className="font-medium text-sm md:text-base flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {vehiculo.ubicacion}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Fuel className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="text-sm font-medium">{vehiculo.combustible}%</span>
                      </div>
                      <p className="text-xs text-gray-600">Combustible</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Wrench className="h-4 w-4 mr-1 text-orange-500" />
                        <span className="text-sm font-medium">15 días</span>
                      </div>
                      <p className="text-xs text-gray-600">Próx. Mant.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Ver Detalles
                    </Button>
                    <Button size="sm" className="bg-trucking-orange-500 hover:bg-trucking-orange-600 text-white flex-1 text-xs">
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

export default Vehiculos;
