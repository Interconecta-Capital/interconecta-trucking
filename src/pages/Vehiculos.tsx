import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit, Trash2, Car, Wrench, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVehiculos } from '@/hooks/useVehiculos';
import { VehiculoFormModal } from '@/components/forms/VehiculoFormModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function Vehiculos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  
  const { 
    vehiculos, 
    loading, 
    crearVehiculo, 
    actualizarVehiculo, 
    eliminarVehiculo,
    isCreating,
    isUpdating,
    isDeleting
  } = useVehiculos();

  const handleCreateVehiculo = async (data) => {
    await crearVehiculo(data);
    setIsFormOpen(false);
  };

  const handleUpdateVehiculo = async (data) => {
    if (editingVehiculo) {
      await actualizarVehiculo({ id: editingVehiculo.id, data });
      setEditingVehiculo(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteVehiculo = async (id) => {
    await eliminarVehiculo(id);
  };

  const filteredVehiculos = vehiculos.filter(vehiculo =>
    vehiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const disponibles = vehiculos.filter(v => v.estado === 'disponible').length;
  const enUso = vehiculos.filter(v => v.estado === 'en_uso').length;
  const mantenimiento = vehiculos.filter(v => v.estado === 'mantenimiento').length;

  const getEstadoBadge = (estado) => {
    const variants = {
      'disponible': 'default',
      'en_uso': 'secondary',
      'mantenimiento': 'destructive',
      'fuera_servicio': 'outline'
    };
    
    const labels = {
      'disponible': 'Disponible',
      'en_uso': 'En Uso',
      'mantenimiento': 'Mantenimiento',
      'fuera_servicio': 'Fuera de Servicio'
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
          <h1 className="text-2xl md:text-3xl font-bold">Vehículos</h1>
          <p className="text-muted-foreground">
            Gestiona tu flota de vehículos
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingVehiculo(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isCreating}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Vehículo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehiculos.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{disponibles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Uso</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{enUso}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mantenimiento</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{mantenimiento}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Lista de Vehículos</CardTitle>
              <CardDescription>
                Administra todos tus vehículos registrados
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, marca o modelo..."
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
              <p className="mt-2 text-muted-foreground">Cargando vehículos...</p>
            </div>
          ) : filteredVehiculos.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No se encontraron vehículos' : 'No hay vehículos registrados'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza registrando tu primer vehículo'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Vehículo
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Seguro</TableHead>
                  <TableHead>Verificación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehiculos.map((vehiculo) => (
                  <TableRow key={vehiculo.id}>
                    <TableCell className="font-medium">{vehiculo.placa}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vehiculo.marca}</div>
                        <div className="text-sm text-muted-foreground">{vehiculo.modelo}</div>
                      </div>
                    </TableCell>
                    <TableCell>{vehiculo.anio}</TableCell>
                    <TableCell>{getEstadoBadge(vehiculo.estado)}</TableCell>
                    <TableCell>
                      {vehiculo.vigencia_seguro ? (
                        <div className="text-sm">
                          {new Date(vehiculo.vigencia_seguro) < new Date() ? (
                            <Badge variant="destructive">Vencido</Badge>
                          ) : (
                            <Badge variant="default">Vigente</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin información</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {vehiculo.verificacion_vigencia ? (
                        <div className="text-sm">
                          {new Date(vehiculo.verificacion_vigencia) < new Date() ? (
                            <Badge variant="destructive">Vencida</Badge>
                          ) : (
                            <Badge variant="default">Vigente</Badge>
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
                            setEditingVehiculo(vehiculo);
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
                              <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El vehículo {vehiculo.placa} será eliminado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteVehiculo(vehiculo.id)}
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

      <VehiculoFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={editingVehiculo ? handleUpdateVehiculo : handleCreateVehiculo}
        vehiculo={editingVehiculo}
        loading={isCreating || isUpdating}
      />
    </div>
  );
}
