
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useVehiculos } from "@/hooks/useVehiculos";
import { BaseLayout } from "@/components/layout/BaseLayout";

const Vehiculos = () => {
  const { vehiculos, isLoading } = useVehiculos();

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="p-3 md:p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
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
              <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Vehículo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-gray-900">{vehiculos.length}</div>
                <div className="text-xs md:text-sm text-gray-600">Total Vehículos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-green-600">{vehiculos.length}</div>
                <div className="text-xs md:text-sm text-gray-600">Activos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-blue-600">0</div>
                <div className="text-xs md:text-sm text-gray-600">Disponibles</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-orange-600">0</div>
                <div className="text-xs md:text-sm text-gray-600">Mantenimiento</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State o Lista de Vehículos */}
        {vehiculos.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gray-100 rounded-full p-6">
                <Truck className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">No hay vehículos registrados</h3>
                <p className="text-gray-600 mt-1">Comienza agregando tu primer vehículo</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Vehículo
              </Button>
            </div>
          </Card>
        ) : (
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
                          {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Activo
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
                    <div>
                      <p className="text-gray-600">Configuración</p>
                      <p className="font-medium">{vehiculo.config_vehicular || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Serie</p>
                      <p className="font-medium">{vehiculo.num_serie || 'No especificado'}</p>
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
        )}
      </div>
    </BaseLayout>
  );
};

export default Vehiculos;
