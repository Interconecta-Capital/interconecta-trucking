
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, Search, Plus, Calendar, Shield } from 'lucide-react';
import { useVehiculos } from '@/hooks/useVehiculos';
import { VehiculoFormModal } from '@/components/forms/VehiculoFormModal';

export default function Vehiculos() {
  const { vehiculos, isLoading } = useVehiculos();

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Vehículos</h1>
          <p className="text-muted-foreground">
            Gestiona tu flota de vehículos
          </p>
        </div>
        <VehiculoFormModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Total Vehículos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehiculos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Vehículos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vehiculos?.filter(v => v.estado === 'disponible').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En Ruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {vehiculos?.filter(v => v.estado === 'en_ruta').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {vehiculos?.filter(v => v.estado === 'mantenimiento').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vehículos</CardTitle>
          <CardDescription>
            Busca y gestiona vehículos
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por placa, marca, modelo..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando vehículos...</div>
          ) : vehiculos && vehiculos.length > 0 ? (
            <div className="space-y-4">
              {vehiculos.map((vehiculo) => (
                <Card key={vehiculo.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{vehiculo.placa}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {vehiculo.marca && vehiculo.modelo && (
                            <span>{vehiculo.marca} {vehiculo.modelo}</span>
                          )}
                          {vehiculo.anio && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {vehiculo.anio}
                            </div>
                          )}
                          {vehiculo.poliza_seguro && (
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              Póliza: {vehiculo.poliza_seguro}
                            </div>
                          )}
                        </div>
                        {vehiculo.config_vehicular && (
                          <p className="text-sm">
                            <strong>Configuración:</strong> {vehiculo.config_vehicular}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehiculo.estado === 'disponible' 
                            ? 'bg-green-100 text-green-800'
                            : vehiculo.estado === 'en_ruta'
                            ? 'bg-blue-100 text-blue-800'
                            : vehiculo.estado === 'mantenimiento'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vehiculo.estado || 'Sin estado'}
                        </span>
                        <VehiculoFormModal 
                          vehiculo={vehiculo}
                          trigger={
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay vehículos registrados</h3>
              <p className="text-muted-foreground mb-4">
                Comienza agregando tu primer vehículo
              </p>
              <VehiculoFormModal 
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Vehículo
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
