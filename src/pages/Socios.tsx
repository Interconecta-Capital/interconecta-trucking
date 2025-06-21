
import { useState } from 'react';
import { Plus, Users, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SociosTable } from '@/components/socios/SociosTable';
import { SociosFilters } from '@/components/socios/SociosFilters';
import { SocioFormDialog } from '@/components/socios/SocioFormDialog';
import { SocioViewDialog } from '@/components/socios/SocioViewDialog';
import { SectionHeader } from '@/components/ui/section-header';
import { useStableSocios } from '@/hooks/useStableSocios';
import { useStableAuth } from '@/hooks/useStableAuth';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';

export default function Socios() {
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
      <div className="container mx-auto py-8">
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center">
            <p className="text-red-800 mb-4">Error cargando socios: {error}</p>
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
    <ProtectedContent requiredFeature="socios">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header estilo Apple */}
        <SectionHeader
          title="Socios Comerciales"
          description="Gestiona tu red de socios y clientes"
          icon={Users}
          className="mb-8"
        >
          <ProtectedActions
            action="create"
            resource="socios"
            onAction={handleNewSocio}
            buttonText="Nuevo Socio"
          />
        </SectionHeader>

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LimitUsageIndicator resourceType="socios" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda estilo Apple */}
        <div className="flex flex-col sm:flex-row gap-4 bg-gray-05 p-4 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-50 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, RFC o email..."
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
            <SociosFilters />
          </div>
        )}

        {/* Stats estilo Apple */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-light to-blue-interconecta/10 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-interconecta">Total Socios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-interconecta">{socios.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-700">Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">{filteredSocios.length}</p>
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
        <SociosTable 
          socios={filteredSocios}
          loading={loading}
          onEdit={(socio) => {
            setSelectedSocio(socio);
            setShowEditDialog(true);
          }}
          onView={(socio) => {
            setSelectedSocio(socio);
            setShowViewDialog(true);
          }}
          onDelete={async (socio) => {
            if (window.confirm(`¿Estás seguro de eliminar el socio ${socio.nombre_razon_social}?`)) {
              try {
                await eliminarSocio(socio.id);
              } catch (error) {
                // Error already handled by hook
              }
            }
          }}
        />

        {/* Diálogos */}
        <SocioFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false);
            recargar();
          }}
        />

        <SocioFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          socio={selectedSocio}
          onSuccess={() => {
            setShowEditDialog(false);
            setSelectedSocio(null);
            recargar();
          }}
        />

        <SocioViewDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          socio={selectedSocio}
          onEdit={() => {
            setShowViewDialog(false);
            setSelectedSocio(selectedSocio);
            setShowEditDialog(true);
          }}
        />
      </div>
    </ProtectedContent>
  );
}
