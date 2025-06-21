
import { useState } from 'react';
import { Plus, Wrench, Filter, Search, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { RemolquesTable } from '@/components/remolques/RemolquesTable';
import { RemolqueFormDialog } from '@/components/remolques/RemolqueFormDialog';
import { VinculacionDialog } from '@/components/remolques/VinculacionDialog';
import { useRemolques } from '@/hooks/useRemolques';
import { useStableAuth } from '@/hooks/useStableAuth';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { toast } from 'sonner';

export default function Remolques() {
  const { user } = useStableAuth();
  const { remolques, loading, error, eliminarRemolque, recargar } = useRemolques(user?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showVinculacionDialog, setShowVinculacionDialog] = useState(false);
  const [selectedRemolque, setSelectedRemolque] = useState<any>(null);

  const handleNewRemolque = () => {
    setSelectedRemolque(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (remolque: any) => {
    setSelectedRemolque(remolque);
    setShowEditDialog(true);
  };

  const handleView = (remolque: any) => {
    // TODO: Implementar vista detallada del remolque
    console.log('Ver remolque:', remolque);
  };

  const handleDelete = async (remolque: any) => {
    if (window.confirm(`¿Estás seguro de eliminar el remolque ${remolque.placa}?`)) {
      try {
        await eliminarRemolque(remolque.id);
        toast.success('Remolque eliminado exitosamente');
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  const handleLink = (remolque: any) => {
    setSelectedRemolque(remolque);
    setShowVinculacionDialog(true);
  };

  const handleUnlink = (remolque: any) => {
    setSelectedRemolque(remolque);
    setShowVinculacionDialog(true);
  };

  const handleSuccess = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setShowVinculacionDialog(false);
    setSelectedRemolque(null);
    recargar();
  };

  const filteredRemolques = remolques.filter(remolque =>
    remolque.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    remolque.tipo_remolque?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const remolquesVinculados = remolques.filter(r => r.vehiculo_asignado_id).length;

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center">
            <p className="text-red-800 mb-4">Error cargando remolques: {error}</p>
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
          title="Remolques"
          description="Gestiona tu flota de remolques y vinculaciones"
          icon={Wrench}
          className="mb-8"
        >
          <div className="flex gap-3">
            <ProtectedActions
              action="create"
              resource="vehiculos"
              onAction={handleNewRemolque}
            >
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Remolque
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
              placeholder="Buscar por placa, tipo o estado..."
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
              <CardTitle className="text-lg text-blue-interconecta">Total Remolques</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-interconecta">{remolques.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-700">Vinculados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">{remolquesVinculados}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-05 to-gray-10 border-gray-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-70">Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-70">{remolques.length - remolquesVinculados}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de remolques */}
        <RemolquesTable 
          remolques={filteredRemolques}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onLink={handleLink}
          onUnlink={handleUnlink}
        />

        {/* Diálogos */}
        <RemolqueFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleSuccess}
        />

        <RemolqueFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          remolque={selectedRemolque}
          onSuccess={handleSuccess}
        />

        <VinculacionDialog
          open={showVinculacionDialog}
          onOpenChange={setShowVinculacionDialog}
          remolque={selectedRemolque}
          onSuccess={handleSuccess}
        />
      </div>
    </ProtectedContent>
  );
}
