
import { useState, useEffect } from 'react';
import { Plus, Users, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConductoresTable } from '@/components/conductores/ConductoresTable';
import { ConductoresFilters } from '@/components/conductores/ConductoresFilters';
import { ConductorFormDialog } from '@/components/conductores/ConductorFormDialog';
import { ConductorViewDialog } from '@/components/conductores/ConductorViewDialog';
import { useConductores } from '@/hooks/useConductores';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { ProtectedContent } from '@/components/ProtectedContent';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { toast } from 'sonner';
import { useFAB } from '@/contexts/FABContext';

export default function ConductoresOptimized() {
  const { conductores, loading, eliminarConductor, recargar } = useConductores();
  const permissions = useUnifiedPermissionsV2();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedConductor, setSelectedConductor] = useState<any>(null);
  const { setFABConfig, setIsModalOpen } = useFAB();
  
  // Notificar al FAB cuando cualquier modal está abierto
  useEffect(() => {
    const anyModalOpen = showCreateDialog || showEditDialog || showViewDialog;
    setIsModalOpen(anyModalOpen);
  }, [showCreateDialog, showEditDialog, showViewDialog, setIsModalOpen]);

  const handleNewConductor = () => {
    console.log('[Conductores] 🆕 Iniciando creación de nuevo conductor');
    
    // Verificar permisos antes de abrir el diálogo
    const permissionCheck = permissions.canCreateConductor;
    if (!permissionCheck.allowed) {
      toast.error(permissionCheck.reason || 'No tienes permisos para crear conductores');
      return;
    }
    
    setSelectedConductor(null);
    setShowCreateDialog(true);
  };

  useEffect(() => {
    setFABConfig({
      icon: <Users className="fab-icon" />,
      text: 'Nuevo',
      onClick: handleNewConductor,
      isVisible: true
    })
    return () => setFABConfig({ isVisible: false })
  }, [])

  const handleEdit = (conductor: any) => {
    setSelectedConductor(conductor);
    setShowEditDialog(true);
  };

  const handleView = (conductor: any) => {
    setSelectedConductor(conductor);
    setShowViewDialog(true);
  };

  const handleDelete = async (conductor: any) => {
    if (window.confirm(`¿Estás seguro de eliminar al conductor ${conductor.nombre}?`)) {
      try {
        await eliminarConductor(conductor.id);
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  const filteredConductores = conductores.filter(conductor =>
    conductor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.num_licencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.telefono?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateConductor = permissions.canCreateConductor;

  return (
    <ProtectedContent requiredFeature="conductores">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header con botón de creación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-light">
              <Users className="h-6 w-6 text-blue-interconecta" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Conductores</h1>
              <p className="text-sm text-gray-600 mt-1">Gestiona tu equipo de conductores</p>
            </div>
          </div>
          
          <Button
            onClick={handleNewConductor}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 desktop-new-button"
            disabled={!canCreateConductor.allowed}
          >
            <Plus className="h-5 w-5" />
            Nuevo Conductor
          </Button>
        </div>

        {!canCreateConductor.allowed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">{canCreateConductor.reason}</p>
          </div>
        )}

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LimitUsageIndicator resourceType="conductores" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 bg-gray-05 p-4 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-50 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, licencia o teléfono..."
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
            <ConductoresFilters />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-light to-blue-interconecta/10 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-interconecta">Total Conductores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-interconecta">{conductores.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-700">Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">{filteredConductores.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-05 to-gray-10 border-gray-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-70">Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-lg font-semibold ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
                {loading ? 'Cargando...' : 'Listo'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla */}
        <ConductoresTable 
          conductores={filteredConductores}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />

        {/* Diálogos */}
        <ConductorFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false);
            recargar();
          }}
        />

        <ConductorFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          conductor={selectedConductor}
          onSuccess={() => {
            setShowEditDialog(false);
            setSelectedConductor(null);
            recargar();
          }}
        />

        <ConductorViewDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          conductor={selectedConductor}
          onEdit={() => {
            setShowViewDialog(false);
            setSelectedConductor(selectedConductor);
            setShowEditDialog(true);
          }}
        />
      </div>
    </ProtectedContent>
  );
}
