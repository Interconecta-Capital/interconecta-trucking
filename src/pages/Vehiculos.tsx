
import { useState } from 'react';
import { Plus, Car, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VehiculosTable } from '@/components/vehiculos/VehiculosTable';
import { VehiculosFilters } from '@/components/vehiculos/VehiculosFilters';
import { VehiculoFormDialog } from '@/components/vehiculos/VehiculoFormDialog';
import { VehiculoViewDialog } from '@/components/vehiculos/VehiculoViewDialog';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';

export default function Vehiculos() {
  const { user } = useAuth();
  const { vehiculos, loading, error, eliminarVehiculo, recargar } = useVehiculos();
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
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  const handleSuccess = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setSelectedVehiculo(null);
    recargar();
  };

  const filteredVehiculos = vehiculos.filter(vehiculo =>
    vehiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error cargando vehículos: {error}</p>
          <Button 
            variant="outline" 
            onClick={recargar}
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedContent requiredFeature="vehiculos">
      <div className="container mx-auto py-6 space-y-6">
        <PlanNotifications />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Vehículos</h1>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>
          <ProtectedActions
            action="create"
            resource="vehiculos"
            onAction={handleNewVehiculo}
            buttonText="Nuevo Vehículo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitUsageIndicator resourceType="vehiculos" className="md:col-span-2" />
        </div>

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
          <Button 
            variant="outline"
            onClick={recargar}
            disabled={loading}
          >
            Actualizar
          </Button>
        </div>

        {showFilters && <VehiculosFilters />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Total Vehículos</h3>
            <p className="text-2xl text-blue-600">{vehiculos.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Resultados</h3>
            <p className="text-2xl text-green-600">{filteredVehiculos.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Estado</h3>
            <p className={`text-sm ${loading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'}`}>
              {loading ? 'Cargando...' : error ? 'Error' : 'Listo'}
            </p>
          </div>
        </div>

        <VehiculosTable 
          vehiculos={filteredVehiculos}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />

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
