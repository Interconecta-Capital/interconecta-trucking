
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Plus, Phone, Mail, IdCard } from 'lucide-react';
import { useConductores } from '@/hooks/useConductores';
import { ConductorFormModal } from '@/components/forms/ConductorFormModal';

export default function Conductores() {
  const { conductores, isLoading } = useConductores();

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Conductores</h1>
          <p className="text-muted-foreground">
            Gestiona tu equipo de conductores
          </p>
        </div>
        <ConductorFormModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Conductores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conductores?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Conductores registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {conductores?.filter(c => c.estado === 'activo').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En Viaje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {conductores?.filter(c => c.estado === 'en_viaje').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {conductores?.filter(c => c.estado === 'disponible').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Conductores</CardTitle>
          <CardDescription>
            Busca y gestiona conductores
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, RFC..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando conductores...</div>
          ) : conductores && conductores.length > 0 ? (
            <div className="space-y-4">
              {conductores.map((conductor) => (
                <Card key={conductor.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{conductor.nombre}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {conductor.rfc && (
                            <div className="flex items-center gap-1">
                              <IdCard className="h-4 w-4" />
                              RFC: {conductor.rfc}
                            </div>
                          )}
                          {conductor.telefono && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {conductor.telefono}
                            </div>
                          )}
                          {conductor.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {conductor.email}
                            </div>
                          )}
                        </div>
                        {conductor.num_licencia && (
                          <p className="text-sm">
                            <strong>Licencia:</strong> {conductor.num_licencia}
                            {conductor.tipo_licencia && ` (${conductor.tipo_licencia})`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          conductor.estado === 'activo' 
                            ? 'bg-green-100 text-green-800'
                            : conductor.estado === 'en_viaje'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {conductor.estado || 'Sin estado'}
                        </span>
                        <ConductorFormModal 
                          conductor={conductor}
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
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay conductores registrados</h3>
              <p className="text-muted-foreground mb-4">
                Comienza agregando tu primer conductor
              </p>
              <ConductorFormModal 
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Conductor
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
