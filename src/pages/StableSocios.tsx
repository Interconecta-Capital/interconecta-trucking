
import { useState } from 'react';
import { Plus, Users, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SociosTable } from '@/components/socios/SociosTable';
import { SociosFilters } from '@/components/socios/SociosFilters';
import { SocioFormDialog } from '@/components/socios/SocioFormDialog';
import { SocioViewDialog } from '@/components/socios/SocioViewDialog';
import { useStableSocios } from '@/hooks/useStableSocios';
import { useStableAuth } from '@/hooks/useStableAuth';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { toast } from 'sonner';

export default function StableSocios() {
  const { user } = useStableAuth();
  const { socios, loading, error, eliminarSocio, recargar } = useStableSocios(user?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedSocio, setSelectedSocio] = useState<any>(null);

  const handleNewSocio = () => {
    setSelectedSocio(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (socio: any) => {
    setSelectedSocio(socio);
    setShowEditDialog(true);
  };

  const handleView = (socio: any) => {
    setSelectedSocio(socio);
    setShowViewDialog(true);
  };

  const handleDelete = async (socio: any) => {
    if (window.confirm(`¿Estás seguro de eliminar el socio ${socio.nombre_razon_social}?`)) {
      try {
        await eliminarSocio(socio.id);
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  const handleSuccess = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setSelectedSocio(null);
    // Reload data after successful operation
    recargar();
  };

  const filteredSocios = socios.filter(socio =>
    socio.nombre_razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    socio.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    socio.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error cargando socios: {error}</p>
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
    <ProtectedContent requiredFeature="socios">
      <div className="container mx-auto py-6 space-y-6">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Socios Comerciales</h1>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>
          <ProtectedActions
            action="create"
            resource="socios"
            onAction={handleNewSocio}
            buttonText="Nuevo Socio"
          />
        </div>

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitUsageIndicator resourceType="socios" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, RFC o email..."
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

        {/* Filtros adicionales */}
        {showFilters && (
          <SociosFilters />
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Total Socios</h3>
            <p className="text-2xl text-blue-600">{socios.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Resultados</h3>
            <p className="text-2xl text-green-600">{filteredSocios.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Estado</h3>
            <p className={`text-sm ${loading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'}`}>
              {loading ? 'Cargando...' : error ? 'Error' : 'Listo'}
            </p>
          </div>
        </div>

        {/* Tabla */}
        <SociosTable 
          socios={filteredSocios}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />

        {/* Diálogos */}
        <SocioFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleSuccess}
        />

        <SocioFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          socio={selectedSocio}
          onSuccess={handleSuccess}
        />

        <SocioViewDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          socio={selectedSocio}
          onEdit={() => {
            setShowViewDialog(false);
            handleEdit(selectedSocio);
          }}
        />
      </div>
    </ProtectedContent>
  );
}
