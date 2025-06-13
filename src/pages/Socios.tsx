import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit, Trash2, Users, Building, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSocios } from '@/hooks/useSocios';
import { SocioFormModal } from '@/components/forms/SocioFormModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function Socios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSocio, setEditingSocio] = useState(null);
  
  const { 
    socios, 
    loading, 
    crearSocio, 
    actualizarSocio, 
    eliminarSocio
  } = useSocios();

  const handleCreateSocio = async (data) => {
    await crearSocio(data);
    setIsFormOpen(false);
  };

  const handleUpdateSocio = async (data) => {
    if (editingSocio) {
      await actualizarSocio({ id: editingSocio.id, data });
      setEditingSocio(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteSocio = async (id) => {
    await eliminarSocio(id);
  };

  const filteredSocios = socios.filter(socio =>
    socio.nombre_razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    socio.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    socio.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activos = socios.filter(s => s.estado === 'activo').length;
  const inactivos = socios.filter(s => s.estado === 'inactivo').length;
  const personasFisicas = socios.filter(s => s.tipo_persona === 'fisica').length;
  const personasMorales = socios.filter(s => s.tipo_persona === 'moral').length;

  const getEstadoBadge = (estado) => {
    const variants = {
      'activo': 'default',
      'inactivo': 'destructive',
      'suspendido': 'secondary'
    };
    
    const labels = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'suspendido': 'Suspendido'
    };

    return (
      <Badge variant={variants[estado] || 'outline'}>
        {labels[estado] || estado}
      </Badge>
    );
  };

  const getTipoPersonaBadge = (tipo) => {
    return (
      <Badge variant={tipo === 'fisica' ? 'outline' : 'secondary'}>
        {tipo === 'fisica' ? 'Persona Física' : 'Persona Moral'}
      </Badge>
    );
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Socios Comerciales</h1>
          <p className="text-muted-foreground">
            Gestiona tus clientes y proveedores
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingSocio(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Socio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Socios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{socios.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personas Físicas</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{personasFisicas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personas Morales</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{personasMorales}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Lista de Socios Comerciales</CardTitle>
              <CardDescription>
                Administra todos tus socios comerciales registrados
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, RFC o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-muted-foreground">Cargando socios...</p>
            </div>
          ) : filteredSocios.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No se encontraron socios' : 'No hay socios registrados'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza registrando tu primer socio comercial'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Socio
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre/Razón Social</TableHead>
                  <TableHead>RFC</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSocios.map((socio) => (
                  <TableRow key={socio.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{socio.nombre_razon_social}</div>
                        {socio.email && (
                          <div className="text-sm text-muted-foreground">{socio.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{socio.rfc}</TableCell>
                    <TableCell>
                      {socio.tipo_persona && getTipoPersonaBadge(socio.tipo_persona)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {socio.telefono && (
                          <div>{socio.telefono}</div>
                        )}
                        {socio.email && (
                          <div className="text-muted-foreground">{socio.email}</div>
                        )}
                        {!socio.telefono && !socio.email && (
                          <span className="text-muted-foreground">Sin contacto</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getEstadoBadge(socio.estado)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSocio(socio);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isDeleting}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar socio?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El socio {socio.nombre_razon_social} será eliminado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSocio(socio.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SocioFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={editingSocio ? handleUpdateSocio : handleCreateSocio}
        socio={editingSocio}
        loading={false}
      />
    </div>
  );
}
