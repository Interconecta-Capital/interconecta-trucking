
import { useState } from 'react';
import { Plus, Users, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConductoresTable } from '@/components/conductores/ConductoresTable';
import { ConductoresFilters } from '@/components/conductores/ConductoresFilters';
import { ConductorFormDialog } from '@/components/conductores/ConductorFormDialog';
import { ConductorViewDialog } from '@/components/conductores/ConductorViewDialog';
import { SectionHeader } from '@/components/ui/section-header';
import { useConductoresOptimized } from '@/hooks/useConductoresOptimized';
import { useStableAuth } from '@/hooks/useStableAuth';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActionsV2 } from '@/components/ProtectedActionsV2'; // ✅ FASE 2: Usando nuevo sistema
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';

export default function ConductoresOptimized() {
  const { user } = useStableAuth();
  const { conductores, loading, error, eliminarConductor, recargar } = useConductoresOptimized(user?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedConductor, setSelectedConductor] = useState<any>(null);

  const handleNewConductor = () => {
    console.log('[Conductores] 🆕 Iniciando creación de nuevo conductor');
    setSelectedConductor(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (conductor: any) => {
    setSelectedConductor(conductor);
    setShowEditDialog(true);
  };

  const handleView = (conductor: any) => {
    setSelectedConductor(conductor);
    setShowViewDialog(true);
  };

  const handleDelete = async (conductor: any) => {
    if (window.confirm(`¿Estás seguro de eliminar el conductor ${conductor.nombre}?`)) {
      try {
        await eliminarConductor(conductor.id);
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  const filteredConductores = conductores.filter(conductor =>
    conductor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.num_licencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center">
            <p className="text-red-800 mb-4">Error cargando conductores: {error}</p>
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

  return (
    <ProtectedContent requiredFeature="conductores">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header estilo Apple */}
        <SectionHeader
          title="Conductores"
          description="Gestiona tu equipo de conductores profesionales"
          icon={Users}
          className="mb-8"
        >
          {/* ✅ FASE 2: Reemplazando ProtectedActions con ProtectedActionsV2 */}
          <ProtectedActionsV2
            resource="conductores"
            onAction={handleNewConductor}
            buttonText="Nuevo Conductor"
            variant="default"
            showReason={true}
          />
        </SectionHeader>

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LimitUsageIndicator resourceType="conductores" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda estilo Apple */}
        <div className="flex flex-col sm:flex-row gap-4 bg-gray-05 p-4 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-50 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, RFC o licencia..."
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

        {/* Stats estilo Apple */}
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
              <p className={`text-lg font-semibold ${loading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'}`}>
                {loading ? 'Cargando...' : error ? 'Error' : 'Listo'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla */}
        <ConductoresTable 
          conductores={filteredConductores}
          loading={loading}
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
