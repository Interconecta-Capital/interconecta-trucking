
import { useState } from 'react';
import { Plus, Car, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VehiculosTable } from '@/components/vehiculos/VehiculosTable';
import { VehiculosFilters } from '@/components/vehiculos/VehiculosFilters';
import { VehiculoFormDialog } from '@/components/vehiculos/VehiculoFormDialog';
import { VehiculoViewDialog } from '@/components/vehiculos/VehiculoViewDialog';
import { useVehiculos } from '@/hooks/useVehiculos';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { toast } from 'sonner';

export default function Vehiculos() {
  const { vehiculos, loading, eliminarVehiculo } = useVehiculos();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(null);

  const handleNewVehiculo = () => {
    setSelectedVehiculo(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (vehiculo: any) => {
    setSelectedVehiculo(vehiculo);
    setShowEditDialog(true);
  };

  const handleView = (vehiculo: any) => {
    setSelectedVehiculo(vehiculo);
    setShowViewDialog(true);
  };

  const handleDelete = async (vehiculo: any) => {
    if (window.confirm(`¿Estás seguro de eliminar el vehículo con placa ${vehiculo.placa}?`)) {
      try {
        await eliminarVehiculo(vehiculo.id);
        toast.success('Vehículo eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar vehículo');
      }
    }
  };

  const handleSuccess = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setSelectedVehiculo(null);
  };

  const filteredVehiculos = vehiculos.filter(vehiculo =>
    vehiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedContent requiredFeature="vehiculos">
      <div className="container mx-auto py-6 space-y-6">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Vehículos</h1>
          </div>
          <ProtectedActions
            action="create"
            resource="vehiculos"
            onAction={handleNewVehiculo}
            buttonText="Nuevo Vehículo"
          />
        </div>

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitUsageIndicator resourceType="vehiculos" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por placa, marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filtros adicionales */}
        {showFilters && (
          <VehiculosFilters />
        )}

        {/* Tabla */}
        <VehiculosTable 
          vehiculos={filteredVehiculos}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />

        {/* Diálogos */}
        <VehiculoFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleSuccess}
        />

        <VehiculoFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          vehiculo={selectedVehiculo}
          onSuccess={handleSuccess}
        />

        <VehiculoViewDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          vehiculo={selectedVehiculo}
          onEdit={() => {
            setShowViewDialog(false);
            handleEdit(selectedVehiculo);
          }}
        />
      </div>
    </ProtectedContent>
  );
}
