
import { useState, useEffect } from 'react';
import { Plus, Truck, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RemolquesTable } from '@/components/remolques/RemolquesTable';
import { RemolqueFormDialog } from '@/components/remolques/RemolqueFormDialog';
import { useRemolques } from '@/hooks/useRemolques';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { ProtectedContent } from '@/components/ProtectedContent';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { toast } from 'sonner';
import { useFAB } from '@/contexts/FABContext';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';

export default function RemolquesOptimized() {
  const { remolques, loading, eliminarRemolque } = useRemolques();
  const permissions = useUnifiedPermissionsV2();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRemolque, setSelectedRemolque] = useState<any>(null);
  const { setFABConfig, setIsModalOpen } = useFAB();
  
  // Notificar al FAB cuando cualquier modal está abierto
  useEffect(() => {
    const anyModalOpen = showCreateDialog || showEditDialog;
    setIsModalOpen(anyModalOpen);
  }, [showCreateDialog, showEditDialog, setIsModalOpen]);

  const handleNewRemolque = () => {
    console.log('[Remolques] 🆕 Iniciando creación de nuevo remolque');
    
    // Verificar permisos antes de abrir el diálogo
    const permissionCheck = permissions.canCreateRemolque;
    if (!permissionCheck.allowed) {
      toast.error(permissionCheck.reason || 'No tienes permisos para crear remolques');
      return;
    }
    
    setSelectedRemolque(null);
    setShowCreateDialog(true);
  };

  useEffect(() => {
    setFABConfig({
      icon: <Truck className="fab-icon" />,
      text: 'Nuevo',
      onClick: handleNewRemolque,
      isVisible: true
    })
    return () => setFABConfig({ isVisible: false })
  }, [])

  const handleEdit = (remolque: any) => {
    setSelectedRemolque(remolque);
    setShowEditDialog(true);
  };

  const handleDelete = async (remolque: any) => {
    if (window.confirm(`¿Estás seguro de eliminar el remolque ${remolque.placa}?`)) {
      try {
        await eliminarRemolque(remolque.id);
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  const filteredRemolques = remolques.filter(remolque =>
    remolque.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    remolque.subtipo_rem?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateRemolque = permissions.canCreateRemolque;

  return (
    <ProtectedContent requiredFeature="remolques">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header con botón de creación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-light">
              <Truck className="h-6 w-6 text-blue-interconecta" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Remolques</h1>
              <p className="text-sm text-gray-600 mt-1">Gestiona tus remolques y equipos</p>
            </div>
          </div>
          
          <Button
            onClick={handleNewRemolque}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 desktop-new-button"
            disabled={!canCreateRemolque.allowed}
          >
            <Plus className="h-5 w-5" />
            Nuevo Remolque
          </Button>
        </div>

        {!canCreateRemolque.allowed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">{canCreateRemolque.reason}</p>
          </div>
        )}

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LimitUsageIndicator resourceType="remolques" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 bg-gray-05 p-4 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-50 h-4 w-4" />
            <Input
              placeholder="Buscar por placa o tipo..."
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
              <CardTitle className="text-lg text-blue-interconecta">Total Remolques</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-interconecta">{remolques.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-700">Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">{filteredRemolques.length}</p>
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
        <RemolquesTable 
          remolques={filteredRemolques as any}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Diálogos */}
        <RemolqueFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false);
          }}
        />

        <RemolqueFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          remolque={selectedRemolque}
          onSuccess={() => {
            setShowEditDialog(false);
            setSelectedRemolque(null);
          }}
        />
      </div>
    </ProtectedContent>
  );
}
