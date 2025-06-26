
import { useState, useEffect } from 'react';
import { Plus, Users, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SociosTable } from '@/components/socios/SociosTable';
import { SocioFormDialog } from '@/components/socios/SocioFormDialog';
import { useSocios } from '@/hooks/useSocios';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { ProtectedContent } from '@/components/ProtectedContent';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { toast } from 'sonner';
import { useFAB } from '@/contexts/FABContext';

export default function SociosOptimized() {
  const { socios, loading: isLoading, eliminarSocio } = useSocios();
  const permissions = useUnifiedPermissionsV2();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSocio, setSelectedSocio] = useState<any>(null);
  const { setFABConfig } = useFAB();

  const handleNewSocio = () => {
    console.log('[Socios] 🆕 Iniciando creación de nuevo socio');
    
    // Verificar permisos antes de abrir el diálogo
    const permissionCheck = permissions.canCreateSocio;
    if (!permissionCheck.allowed) {
      toast.error(permissionCheck.reason || 'No tienes permisos para crear socios');
      return;
    }
    
    setSelectedSocio(null);
    setShowCreateDialog(true);
  };

  useEffect(() => {
    setFABConfig({
      icon: <Users className="fab-icon" />,
      text: 'Nuevo',
      onClick: handleNewSocio,
      isVisible: true
    })
    return () => setFABConfig({ isVisible: false })
  }, [])

  const handleEdit = (socio: any) => {
    setSelectedSocio(socio);
    setShowEditDialog(true);
  };

  const handleDelete = async (socio: any) => {
    if (window.confirm(`¿Estás seguro de eliminar al socio ${socio.nombre_razon_social}?`)) {
      try {
        await eliminarSocio(socio.id);
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  const filteredSocios = socios.filter(socio =>
    socio.nombre_razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    socio.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    socio.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateSocio = permissions.canCreateSocio;

  return (
    <ProtectedContent requiredFeature="socios">
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
              <h1 className="text-2xl font-bold text-gray-900">Socios</h1>
              <p className="text-sm text-gray-600 mt-1">Gestiona tu red de socios comerciales</p>
            </div>
          </div>
          
          <Button
            onClick={handleNewSocio}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 desktop-new-button"
            disabled={!canCreateSocio.allowed}
          >
            <Plus className="h-5 w-5" />
            Nuevo Socio
          </Button>
        </div>

        {!canCreateSocio.allowed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">{canCreateSocio.reason}</p>
          </div>
        )}

        {/* Filtros y búsqueda */}
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
        </div>

        {/* Stats */}
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
              <p className={`text-lg font-semibold ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                {isLoading ? 'Cargando...' : 'Listo'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla */}
        <SociosTable 
          socios={filteredSocios}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Diálogos */}
        <SocioFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false);
          }}
        />

        <SocioFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          socio={selectedSocio}
          onSuccess={() => {
            setShowEditDialog(false);
            setSelectedSocio(null);
          }}
        />
      </div>
    </ProtectedContent>
  );
}
