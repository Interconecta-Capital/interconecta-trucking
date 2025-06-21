import { useState } from 'react';
import { Plus, Car, Filter, Search, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehiculosTable } from '@/components/vehiculos/VehiculosTable';
import { VehiculosFilters } from '@/components/vehiculos/VehiculosFilters';
import { VehiculoFormDialog } from '@/components/vehiculos/VehiculoFormDialog';
import { VehiculoViewDialog } from '@/components/vehiculos/VehiculoViewDialog';
import { RemolquesTable } from '@/components/vehiculos/RemolquesTable';
import { RemolqueFormDialog } from '@/components/vehiculos/RemolqueFormDialog';
import { useStableVehiculos } from '@/hooks/useStableVehiculos';
import { useRemolques } from '@/hooks/useRemolques';
import { useStableAuth } from '@/hooks/useStableAuth';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { toast } from 'sonner';

export default function StableVehiculos() {
  const { user } = useStableAuth();
  const { vehiculos, loading: vehiculosLoading, error: vehiculosError, eliminarVehiculo, recargar: recargarVehiculos } = useStableVehiculos(user?.id);
  const { remolques, loading: remolquesLoading, error: remolquesError, eliminarRemolque, recargar: recargarRemolques } = useRemolques(user?.id);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateVehiculoDialog, setShowCreateVehiculoDialog] = useState(false);
  const [showEditVehiculoDialog, setShowEditVehiculoDialog] = useState(false);
  const [showViewVehiculoDialog, setShowViewVehiculoDialog] = useState(false);
  const [showCreateRemolqueDialog, setShowCreateRemolqueDialog] = useState(false);
  const [showEditRemolqueDialog, setShowEditRemolqueDialog] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(null);
  const [selectedRemolque, setSelectedRemolque] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('vehiculos');

  const handleNewVehiculo = () => {
    setSelectedVehiculo(null);
    setShowCreateVehiculoDialog(true);
  };

  const handleNewRemolque = () => {
    setSelectedRemolque(null);
    setShowCreateRemolqueDialog(true);
  };

  const handleEditVehiculo = (vehiculo: any) => {
    setSelectedVehiculo(vehiculo);
    setShowEditVehiculoDialog(true);
  };

  const handleViewVehiculo = (vehiculo: any) => {
    setSelectedVehiculo(vehiculo);
    setShowViewVehiculoDialog(true);
  };

  const handleDeleteVehiculo = async (vehiculo: any) => {
    if (window.confirm(`¿Estás seguro de eliminar el vehículo con placa ${vehiculo.placa}?`)) {
      try {
        await eliminarVehiculo(vehiculo.id);
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  const handleEditRemolque = (remolque: any) => {
    setSelectedRemolque(remolque);
    setShowEditRemolqueDialog(true);
  };

  const handleDeleteRemolque = async (remolque: any) => {
    if (window.confirm(`¿Estás seguro de eliminar el remolque con placa ${remolque.placa}?`)) {
      try {
        await eliminarRemolque(remolque.id);
      } catch (error) {
        toast.error('Error al eliminar el remolque');
      }
    }
  };

  const handleSuccess = () => {
    setShowCreateVehiculoDialog(false);
    setShowEditVehiculoDialog(false);
    setShowCreateRemolqueDialog(false);
    setShowEditRemolqueDialog(false);
    setSelectedVehiculo(null);
    setSelectedRemolque(null);
    recargarVehiculos();
    recargarRemolques();
  };

  const filteredVehiculos = vehiculos.filter(vehiculo =>
    vehiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRemolques = remolques.filter(remolque =>
    remolque.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    remolque.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    remolque.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (vehiculosError || remolquesError) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error cargando datos: {vehiculosError || remolquesError}</p>
          <Button 
            variant="outline" 
            onClick={() => {
              recargarVehiculos();
              recargarRemolques();
            }}
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
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Vehículos y Remolques</h1>
            {(vehiculosLoading || remolquesLoading) && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>
          <div className="flex gap-2">
            <ProtectedActions
              action="create"
              resource="vehiculos"
              onAction={handleNewVehiculo}
              buttonText="Nuevo Vehículo"
              variant="default"
            />
            <ProtectedActions
              action="create"
              resource="vehiculos"
              onAction={handleNewRemolque}
              buttonText="Nuevo Remolque"
              variant="outline"
            />
          </div>
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
          <Button 
            variant="outline"
            onClick={() => {
              recargarVehiculos();
              recargarRemolques();
            }}
            disabled={vehiculosLoading || remolquesLoading}
          >
            Actualizar
          </Button>
        </div>

        {/* Filtros adicionales */}
        {showFilters && (
          <VehiculosFilters />
        )}

        {/* Tabs para vehículos y remolques */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vehiculos" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehículos ({vehiculos.length})
            </TabsTrigger>
            <TabsTrigger value="remolques" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Remolques ({remolques.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="vehiculos" className="space-y-4">
            {/* Stats Vehículos */}
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
                <p className={`text-sm ${vehiculosLoading ? 'text-yellow-600' : vehiculosError ? 'text-red-600' : 'text-green-600'}`}>
                  {vehiculosLoading ? 'Cargando...' : vehiculosError ? 'Error' : 'Listo'}
                </p>
              </div>
            </div>

            <VehiculosTable 
              vehiculos={filteredVehiculos}
              loading={vehiculosLoading}
              onEdit={handleEditVehiculo}
              onView={handleViewVehiculo}
              onDelete={handleDeleteVehiculo}
            />
          </TabsContent>
          
          <TabsContent value="remolques" className="space-y-4">
            {/* Stats Remolques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold">Total Remolques</h3>
                <p className="text-2xl text-blue-600">{remolques.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold">Resultados</h3>
                <p className="text-2xl text-green-600">{filteredRemolques.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold">Estado</h3>
                <p className={`text-sm ${remolquesLoading ? 'text-yellow-600' : remolquesError ? 'text-red-600' : 'text-green-600'}`}>
                  {remolquesLoading ? 'Cargando...' : remolquesError ? 'Error' : 'Listo'}
                </p>
              </div>
            </div>

            <RemolquesTable 
              remolques={filteredRemolques}
              loading={remolquesLoading}
              onEdit={handleEditRemolque}
              onDelete={handleDeleteRemolque}
            />
          </TabsContent>
        </Tabs>

        {/* Diálogos */}
        <VehiculoFormDialog
          open={showCreateVehiculoDialog}
          onOpenChange={setShowCreateVehiculoDialog}
          onSuccess={handleSuccess}
        />

        <VehiculoFormDialog
          open={showEditVehiculoDialog}
          onOpenChange={setShowEditVehiculoDialog}
          vehiculo={selectedVehiculo}
          onSuccess={handleSuccess}
        />

        <VehiculoViewDialog
          open={showViewVehiculoDialog}
          onOpenChange={setShowViewVehiculoDialog}
          vehiculo={selectedVehiculo}
          onEdit={() => {
            setShowViewVehiculoDialog(false);
            handleEditVehiculo(selectedVehiculo);
          }}
        />

        <RemolqueFormDialog
          open={showCreateRemolqueDialog}
          onOpenChange={setShowCreateRemolqueDialog}
          onSuccess={handleSuccess}
        />

        <RemolqueFormDialog
          open={showEditRemolqueDialog}
          onOpenChange={setShowEditRemolqueDialog}
          remolque={selectedRemolque}
          onSuccess={handleSuccess}
        />
      </div>
    </ProtectedContent>
  );
}
