
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building, Search, Plus, Phone, Mail, IdCard } from 'lucide-react';
import { useSocios } from '@/hooks/useSocios';
import { SocioFormModal } from '@/components/forms/SocioFormModal';

export default function Socios() {
  const { socios, isLoading } = useSocios();

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Socios Comerciales</h1>
          <p className="text-muted-foreground">
            Gestiona tus socios comerciales y clientes
          </p>
        </div>
        <SocioFormModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Total Socios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{socios?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Socios registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personas Físicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {socios?.filter(s => s.tipo_persona === 'fisica').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personas Morales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {socios?.filter(s => s.tipo_persona === 'moral').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {socios?.filter(s => s.activo !== false).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Socios</CardTitle>
          <CardDescription>
            Busca y gestiona socios comerciales
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
            <div className="text-center py-8">Cargando socios...</div>
          ) : socios && socios.length > 0 ? (
            <div className="space-y-4">
              {socios.map((socio) => (
                <Card key={socio.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{socio.nombre_razon_social}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <IdCard className="h-4 w-4" />
                            RFC: {socio.rfc}
                          </div>
                          {socio.telefono && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {socio.telefono}
                            </div>
                          )}
                          {socio.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {socio.email}
                            </div>
                          )}
                        </div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          socio.tipo_persona === 'fisica' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {socio.tipo_persona === 'fisica' ? 'Persona Física' : 'Persona Moral'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <SocioFormModal 
                          socio={socio}
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
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay socios registrados</h3>
              <p className="text-muted-foreground mb-4">
                Comienza agregando tu primer socio comercial
              </p>
              <SocioFormModal 
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Socio
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
