
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
  MapPin,
  Building,
  TrendingUp,
  Calendar,
  DollarSign
} from "lucide-react";
import { useSocios } from "@/hooks/useSocios";
import { BaseLayout } from "@/components/layout/BaseLayout";

const Socios = () => {
  const { socios, isLoading } = useSocios();

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
                    placeholder="Buscar por nombre, RFC, contacto..." 
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
                Nuevo Socio
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-gray-900">{socios.length}</div>
                <div className="text-xs md:text-sm text-gray-600">Total Socios</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-green-600">{socios.length}</div>
                <div className="text-xs md:text-sm text-gray-600">Activos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-purple-600">0</div>
                <div className="text-xs md:text-sm text-gray-600">Premium</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-trucking-orange-600">$0</div>
                <div className="text-xs md:text-sm text-gray-600">Facturación</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State o Lista de Socios */}
        {socios.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gray-100 rounded-full p-6">
                <Building className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">No hay socios registrados</h3>
                <p className="text-gray-600 mt-1">Comienza agregando tu primer socio comercial</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Socio
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {socios.map((socio) => (
              <Card key={socio.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                        <AvatarFallback className="bg-trucking-blue-100 text-trucking-blue-600 font-semibold text-xs md:text-sm">
                          {getInitials(socio.nombre_razon_social)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base md:text-lg leading-tight truncate">{socio.nombre_razon_social}</CardTitle>
                        <p className="text-xs md:text-sm text-gray-600 truncate">{socio.rfc}</p>
                        <p className="text-xs text-gray-500">{socio.tipo_persona === 'fisica' ? 'Persona Física' : 'Persona Moral'}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Activo
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 gap-2 md:gap-3 text-xs md:text-sm">
                    {socio.telefono && (
                      <div className="flex items-center min-w-0">
                        <Phone className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{socio.telefono}</span>
                      </div>
                    )}
                    {socio.email && (
                      <div className="flex items-center min-w-0">
                        <Mail className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{socio.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Building className="h-3 w-3 mr-1" />
                      Ver Perfil
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Historial
                    </Button>
                    <Button size="sm" className="bg-trucking-orange-500 hover:bg-trucking-orange-600 text-white flex-1 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Cotizar
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

export default Socios;
