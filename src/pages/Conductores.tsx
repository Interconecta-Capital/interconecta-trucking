
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertTriangle,
  Users
} from "lucide-react";
import { useConductores } from "@/hooks/useConductores";
import { BaseLayout } from "@/components/layout/BaseLayout";

const Conductores = () => {
  const { conductores, isLoading } = useConductores();

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const isLicenseExpiring = (fecha: string) => {
    if (!fecha) return false;
    const today = new Date();
    const expirationDate = new Date(fecha);
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 30;
  };

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
                    placeholder="Buscar por nombre, licencia, teléfono..." 
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
                Nuevo Conductor
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-gray-900">{conductores.length}</div>
                <div className="text-xs md:text-sm text-gray-600">Total Conductores</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-green-600">{conductores.length}</div>
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
                <div className="text-lg md:text-2xl font-bold text-red-600">0</div>
                <div className="text-xs md:text-sm text-gray-600">Docs. Vencidos</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State o Lista de Conductores */}
        {conductores.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gray-100 rounded-full p-6">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">No hay conductores registrados</h3>
                <p className="text-gray-600 mt-1">Comienza agregando tu primer conductor</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Conductor
              </Button>
            </div>
          </Card>
        ) : (
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
                        <p className="text-xs md:text-sm text-gray-600">Conductor activo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Activo
                      </Badge>
                      {conductor.vigencia_licencia && isLicenseExpiring(conductor.vigencia_licencia) && (
                        <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                    {conductor.telefono && (
                      <div className="flex items-center min-w-0">
                        <Phone className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{conductor.telefono}</span>
                      </div>
                    )}
                    {conductor.email && (
                      <div className="flex items-center min-w-0">
                        <Mail className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{conductor.email}</span>
                      </div>
                    )}
                    {conductor.num_licencia && (
                      <div className="flex items-center min-w-0">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Lic: {conductor.num_licencia}</span>
                      </div>
                    )}
                    {conductor.rfc && (
                      <div className="flex items-center min-w-0">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{conductor.rfc}</span>
                      </div>
                    )}
                  </div>

                  {conductor.vigencia_licencia && isLicenseExpiring(conductor.vigencia_licencia) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-orange-500 mr-2 flex-shrink-0" />
                        <span className="text-xs md:text-sm text-orange-700">
                          Licencia vence el {conductor.vigencia_licencia}
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
        )}
      </div>
    </BaseLayout>
  );
};

export default Conductores;
