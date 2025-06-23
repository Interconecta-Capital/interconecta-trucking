
import { useState } from 'react';
import { Plus, Car, Filter, Search, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehiculosTable } from '@/components/vehiculos/VehiculosTable';
import { VehiculosFilters } from '@/components/vehiculos/VehiculosFilters';
import { VehiculoFormDialog } from '@/components/vehiculos/VehiculoFormDialog';
import { VehiculoViewDialog } from '@/components/vehiculos/VehiculoViewDialog';
import { RemolqueFormDialog } from '@/components/vehiculos/RemolqueFormDialog';
import { SectionHeader } from '@/components/ui/section-header';
import { useStableVehiculos } from '@/hooks/useStableVehiculos';
import { useStableAuth } from '@/hooks/useStableAuth';
import { ProtectedContent } from '@/components/ProtectedContent';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { toast } from 'sonner';

export default function StableVehiculos() {
  const { user } = useStableAuth();
  const { vehiculos, loading, error, eliminarVehiculo, recargar } = useStableVehiculos(user?.id);
  const permissions = useUnifiedPermissionsV2();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showRemolqueDialog, setShowRemolqueDialog] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(null);

  const handleNewVehiculo = () => {
    console.log('[Vehiculos] 🆕 Iniciando creación de nuevo vehículo');
    
    // Verificar permisos antes de abrir el diálogo
    const permissionCheck = permissions.canCreateVehiculo();
    if (!permissionCheck.allowed) {
      toast.error(permissionCheck.reason || 'No tienes permisos para crear vehículos');
      return;
    }
    
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
    if (window.confirm(`¿Estás seguro de eliminar el vehículo ${vehiculo.num_serie}?`)) {
      try {
        await eliminarVehiculo(vehiculo.id);
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  const filteredVehiculos = vehiculos.filter(vehiculo =>
    vehiculo.num_serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase())
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
              className="bg-pure-white"
            >
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Verificar si se puede crear vehículo
  const canCreateVehiculo = permissions.canCreateVehiculo();

  return (
    <ProtectedContent requiredFeature="vehiculos">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header estilo Apple */}
        <SectionHeader
          title="Flota de Vehículos"
          description="Gestiona tus vehículos y unidades de transporte"
          icon={Car}
          className="mb-8"
        >
          <Button 
            onClick={handleNewVehiculo} 
            variant="default" 
            className="flex items-center gap-2"
            disabled={!canCreateVehiculo.allowed}
          >
            <Plus className="h-4 w-4" />
            Nuevo Vehículo
          </Button>
          {!canCreateVehiculo.allowed && (
            <p className="text-sm text-red-600 mt-1">{canCreateVehiculo.reason}</p>
          )}
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
              placeholder="Buscar por serie, placa o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-0 bg-pure-white shadow-sm"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-6 bg-pure-white shadow-sm border-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button 
            variant="outline"
            onClick={recargar}
            disabled={loading}
            className="h-12 px-6 bg-pure-white shadow-sm border-0"
          >
            Actualizar
          </Button>
        </div>

        {/* Filtros adicionales */}
        {showFilters && (
          <div className="bg-pure-white rounded-2xl border border-gray-20 shadow-sm p-6">
            <VehiculosFilters />
          </div>
        )}

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
          onSuccess={() => {
            setShowCreateDialog(false);
            recargar();
          }}
        />

        <VehiculoFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          vehiculo={selectedVehiculo}
          onSuccess={() => {
            setShowEditDialog(false);
            setSelectedVehiculo(null);
            recargar();
          }}
        />

        <VehiculoViewDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          vehiculo={selectedVehiculo}
          onEdit={() => {
            setShowViewDialog(false);
            setSelectedVehiculo(selectedVehiculo);
            setShowEditDialog(true);
          }}
        />

        <RemolqueFormDialog
          open={showRemolqueDialog}
          onOpenChange={setShowRemolqueDialog}
          onSuccess={() => {
            setShowRemolqueDialog(false);
            recargar();
          }}
        />
      </div>
    </ProtectedContent>
  );
}
