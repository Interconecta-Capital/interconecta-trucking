
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit, Trash2, User, UserCheck, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useConductores } from '@/hooks/useConductores';
import { ConductorFormModal } from '@/components/forms/ConductorFormModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function Conductores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState(null);
  
  const { 
    conductores, 
    loading, 
    crearConductor, 
    actualizarConductor, 
    eliminarConductor,
    isCreating,
    isUpdating,
    isDeleting
  } = useConductores();

  const handleCreateConductor = async (data) => {
    await crearConductor(data);
    setIsFormOpen(false);
  };

  const handleUpdateConductor = async (data) => {
    if (editingConductor) {
      await actualizarConductor({ id: editingConductor.id, data });
      setEditingConductor(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteConductor = async (id) => {
    await eliminarConductor(id);
  };

  const filteredConductores = conductores.filter(conductor =>
    conductor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.num_licencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.rfc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const disponibles = conductores.filter(c => c.estado === 'disponible').length;
  const enViaje = conductores.filter(c => c.estado === 'en_viaje').length;
  const descanso = conductores.filter(c => c.estado === 'descanso').length;

  const getEstadoBadge = (estado) => {
    const variants = {
      'disponible': 'default',
      'en_viaje': 'secondary',
      'descanso': 'outline',
      'inactivo': 'destructive'
    };
    
    const labels = {
      'disponible': 'Disponible',
      'en_viaje': 'En Viaje',
      'descanso': 'Descanso',
      'inactivo': 'Inactivo'
    };

    return (
      <Badge variant={variants[estado] || 'outline'}>
        {labels[estado] || estado}
      </Badge>
    );
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Conductores</h1>
          <p className="text-muted-foreground">
            Gestiona tu equipo de conductores
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingConductor(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isCreating}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Conductor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conductores</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conductores.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{disponibles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Viaje</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{enViaje}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Descanso</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{descanso}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Lista de Conductores</CardTitle>
              <CardDescription>
                Administra todos tus conductores registrados
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, licencia o RFC..."
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
              <p className="mt-2 text-muted-foreground">Cargando conductores...</p>
            </div>
          ) : filteredConductores.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No se encontraron conductores' : 'No hay conductores registrados'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza registrando tu primer conductor'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Conductor
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>RFC</TableHead>
                  <TableHead>Licencia</TableHead>
                  <TableHead>Tipo Licencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vigencia Licencia</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConductores.map((conductor) => (
                  <TableRow key={conductor.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{conductor.nombre}</div>
                        {conductor.telefono && (
                          <div className="text-sm text-muted-foreground">{conductor.telefono}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{conductor.rfc || 'Sin RFC'}</TableCell>
                    <TableCell className="font-mono text-sm">{conductor.num_licencia || 'Sin licencia'}</TableCell>
                    <TableCell>{conductor.tipo_licencia || 'No especificado'}</TableCell>
                    <TableCell>{getEstadoBadge(conductor.estado)}</TableCell>
                    <TableCell>
                      {conductor.vigencia_licencia ? (
                        <div className="text-sm">
                          {new Date(conductor.vigencia_licencia) < new Date() ? (
                            <Badge variant="destructive">Vencida</Badge>
                          ) : (
                            <div>
                              <Badge variant="default">Vigente</Badge>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(conductor.vigencia_licencia).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin información</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingConductor(conductor);
                            setIsFormOpen(true);
                          }}
                          disabled={isUpdating}
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
                              <AlertDialogTitle>¿Eliminar conductor?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El conductor {conductor.nombre} será eliminado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteConductor(conductor.id)}
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

      <ConductorFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={editingConductor ? handleUpdateConductor : handleCreateConductor}
        conductor={editingConductor}
        loading={isCreating || isUpdating}
      />
    </div>
  );
}
