
import { useState } from 'react';
import { Plus, Truck, Filter, Search, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehiculosTable } from '@/components/vehiculos/VehiculosTable';
import { VehiculoFormDialog } from '@/components/vehiculos/VehiculoFormDialog';
import { VehiculoViewDialog } from '@/components/vehiculos/VehiculoViewDialog';
import { SectionHeader } from '@/components/ui/section-header';
import { useStableVehiculos } from '@/hooks/useStableVehiculos';
import { useStableAuth } from '@/hooks/useStableAuth';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { useNavigate } from 'react-router-dom';

export default function StableVehiculos() {
  const navigate = useNavigate();
  const { user } = useStableAuth();
  const { vehiculos, loading, error, eliminarVehiculo, recargar } = useStableVehiculos(user?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(null);

  // Fixed: No parameters for ProtectedActions compatibility
  const handleNewVehiculo = () => {
    setSelectedVehiculo(null);
    setShowCreateDialog(true);
  };

  // Fixed: No parameters for ProtectedActions compatibility - Navigate to remolques page
  const handleNewRemolque = () => {
    navigate('/remolques');
  };

  // These handlers need parameters, so they're separate
  const handleEdit = (vehiculo: any) => {
    setSelectedVehiculo(vehiculo);
    setShowEditDialog(true);
  };

  const handleView = (vehiculo: any) => {
    setSelectedVehiculo(vehiculo);
    setShowViewDialog(true);
  };

  const handleDelete = async (vehiculo: any) => {
    if (window.confirm(`¿Estás seguro de eliminar el vehículo ${vehiculo.placa}?`)) {
      try {
        await eliminarVehiculo(vehiculo.id);
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  // Fixed: Function for VehiculoViewDialog.onEdit (no parameters)
  const handleEditFromView = () => {
    if (selectedVehiculo) {
      setShowViewDialog(false);
      handleEdit(selectedVehiculo);
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
      <div className="container mx-auto py-8">
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center">
            <p className="text-red-800 mb-4">Error cargando vehículos: {error}</p>
            <Button 
              variant="outline" 
              onClick={recargar}
              className="bg-white-force"
            >
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedContent requiredFeature="vehiculos">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header estilo Apple */}
        <SectionHeader
          title="Flota Vehicular"
          description="Gestiona tu flota de vehículos y remolques"
          icon={Truck}
          className="mb-8"
        >
          <div className="flex gap-3">
            <ProtectedActions
              action="create"
              resource="vehiculos"
              onAction={handleNewRemolque}
            >
              <Button variant="outline" className="flex items-center gap-2 bg-white-force">
                <Wrench className="h-4 w-4" />
                Nuevo Remolque
              </Button>
            </ProtectedActions>
            <ProtectedActions
              action="create"
              resource="vehiculos"
              onAction={handleNewVehiculo}
            >
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Vehículo
              </Button>
            </ProtectedActions>
          </div>
        </SectionHeader>

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LimitUsageIndicator resourceType="vehiculos" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda estilo Apple */}
        <div className="flex flex-col sm:flex-row gap-4 bg-gray-05 p-4 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-50 h-4 w-4" />
            <Input
              placeholder="Buscar por placa, marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-0 bg-white-force shadow-sm"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-6 bg-white-force shadow-sm border-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button 
            variant="outline"
            onClick={recargar}
            disabled={loading}
            className="h-12 px-6 bg-white-force shadow-sm border-0"
          >
            Actualizar
          </Button>
        </div>

        {/* Stats estilo Apple */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-light to-blue-interconecta/10 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-interconecta">Total Vehículos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-interconecta">{vehiculos.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-700">Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">{filteredVehiculos.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-05 to-gray-10 border-gray-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-70">Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-lg font-semibold ${loading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'}`}>
                {loading ? 'Cargando...' : error ? 'Error' : 'Listo'}
              </p>
            </CardContent>
          </Card>
        </div>

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
          onEdit={handleEditFromView}
        />
      </div>
    </ProtectedContent>
  );
}
