
import { useState } from 'react';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useVehiculoConductores } from '@/hooks/useVehiculoConductores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VehiculoFormModal } from '@/components/forms/VehiculoFormModal';
import { ProtectedActions } from '@/components/ProtectedActions';
import { Plus, Search, Edit, Trash2, Truck, User, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface DataTableSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

function DataTableSearch({ query, onQueryChange }: DataTableSearchProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Search className="w-4 h-4 mr-2 text-gray-500" />
        <Input
          type="search"
          placeholder="Buscar vehículo..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
    </div>
  );
}

export default function Vehiculos() {
  const [showForm, setShowForm] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { vehiculos, crearVehiculo, actualizarVehiculo, eliminarVehiculo, loading } = useVehiculos();

  const handleCreate = async (data: any) => {
    try {
      await crearVehiculo(data);
      toast.success('Vehículo creado exitosamente');
      setShowForm(false);
    } catch (error: any) {
      toast.error(`Error al crear vehículo: ${error.message}`);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await actualizarVehiculo({ id: selectedVehiculo.id, ...data });
      toast.success('Vehículo actualizado exitosamente');
      setShowForm(false);
      setSelectedVehiculo(null);
    } catch (error: any) {
      toast.error(`Error al actualizar vehículo: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eliminarVehiculo(id);
      toast.success('Vehículo eliminado exitosamente');
    } catch (error: any) {
      toast.error(`Error al eliminar vehículo: ${error.message}`);
    }
  };

  const handleEdit = (vehiculo: any) => {
    setSelectedVehiculo(vehiculo);
    setShowForm(true);
  };

  const filteredVehiculos = vehiculos.filter((vehiculo) =>
    vehiculo.placa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehiculo.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehiculo.modelo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado de la página */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Vehículos
          </h2>
          <p className="text-sm text-muted-foreground">
            Administra tu flota de vehículos
          </p>
        </div>
        <ProtectedActions
          action="create"
          resource="vehiculos"
          onAction={() => setShowForm(true)}
          buttonText="Registrar Vehículo"
        >
          <div />
        </ProtectedActions>
      </div>

      {/* Buscador de vehículos */}
      <DataTableSearch
        query={searchQuery}
        onQueryChange={setSearchQuery}
      />
      
      {/* Tabla de vehículos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Lista de Vehículos
          </CardTitle>
          <CardDescription>
            Gestiona tu flota de vehículos y sus conductores asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vehiculos.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay vehículos registrados
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza agregando tu primer vehículo a la flota
              </p>
              <ProtectedActions
                action="create"
                resource="vehiculos"
                onAction={() => setShowForm(true)}
                buttonText="Registrar Primer Vehículo"
              >
                <div />
              </ProtectedActions>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Conductores</TableHead>
                    <TableHead>Seguro</TableHead>
                    <TableHead>Verificación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehiculos.map((vehiculo) => {
                    const { asignaciones } = useVehiculoConductores(vehiculo.id);
                    
                    return (
                      <TableRow key={vehiculo.id}>
                        <TableCell className="font-medium">
                          {vehiculo.placa}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vehiculo.marca}</div>
                            <div className="text-sm text-muted-foreground">
                              {vehiculo.modelo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{vehiculo.anio || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              vehiculo.estado === 'disponible' ? 'default' :
                              vehiculo.estado === 'en_uso' ? 'secondary' :
                              vehiculo.estado === 'mantenimiento' ? 'destructive' :
                              'outline'
                            }
                          >
                            {vehiculo.estado === 'disponible' && 'Disponible'}
                            {vehiculo.estado === 'en_uso' && 'En Uso'}
                            {vehiculo.estado === 'mantenimiento' && 'Mantenimiento'}
                            {vehiculo.estado === 'fuera_servicio' && 'Fuera de Servicio'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {asignaciones.length} conductor{asignaciones.length !== 1 ? 'es' : ''}
                            </span>
                          </div>
                          {asignaciones.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {asignaciones.map(a => a.conductor?.nombre).join(', ')}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              {vehiculo.vigencia_seguro ? (
                                <div>
                                  <div>{vehiculo.poliza_seguro || 'N/A'}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Vence: {new Date(vehiculo.vigencia_seguro).toLocaleDateString()}
                                  </div>
                                </div>
                              ) : (
                                'Sin seguro'
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              {vehiculo.verificacion_vigencia ? (
                                <div className="text-xs">
                                  Vence: {new Date(vehiculo.verificacion_vigencia).toLocaleDateString()}
                                </div>
                              ) : (
                                'Sin verificación'
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(vehiculo)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(vehiculo.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal del formulario */}
      <VehiculoFormModal
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={selectedVehiculo ? handleUpdate : handleCreate}
        vehiculo={selectedVehiculo}
      />
    </div>
  );
}
