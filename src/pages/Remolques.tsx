
import { useState } from 'react';
import { Plus, Wrench, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RemolquesTable } from '@/components/remolques/RemolquesTable';
import { RemolqueFormDialog } from '@/components/remolques/RemolqueFormDialog';
import { VinculacionDialog } from '@/components/remolques/VinculacionDialog';
import { SectionHeader } from '@/components/ui/section-header';
import { useRemolques } from '@/hooks/useRemolques';
import { useStableAuth } from '@/hooks/useStableAuth';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActionsV2 } from '@/components/ProtectedActionsV2';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';

// Updated interface to match what RemolquesTable expects
interface Remolque {
  id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  subtipo_rem?: string;
  estado: string;
  vehiculo_asignado_id?: string;
  activo: boolean;
}

export default function Remolques() {
  const { user } = useStableAuth();
  const { remolques, loading, error, eliminarRemolque, recargar } = useRemolques(user?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showVinculacionDialog, setShowVinculacionDialog] = useState(false);
  const [selectedRemolque, setSelectedRemolque] = useState<any>(null);

  const handleNewRemolque = () => {
    console.log('[Remolques] 🆕 Iniciando creación de nuevo remolque');
    setSelectedRemolque(null);
    setShowCreateDialog(true);
  };

  const handleVincular = (remolque: any) => {
    setSelectedRemolque(remolque);
    setShowVinculacionDialog(true);
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

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center">
            <p className="text-red-800 mb-4">Error cargando remolques: {error}</p>
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
    <ProtectedContent requiredFeature="vehiculos">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header estilo Apple */}
        <SectionHeader
          title="Remolques y Semirremolques"
          description="Gestiona tus unidades de carga y remolques"
          icon={Wrench}
          className="mb-8"
        >
          <ProtectedActionsV2
            resource="remolques"
            onAction={handleNewRemolque}
            buttonText="Nuevo Remolque"
            variant="default"
            showReason={true}
          />
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
              placeholder="Buscar por placa o subtipo..."
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
              <p className={`text-lg font-semibold ${loading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'}`}>
                {loading ? 'Cargando...' : error ? 'Error' : 'Listo'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla */}
        <RemolquesTable 
          remolques={filteredRemolques}
          loading={loading}
          onLink={handleVincular}
          onDelete={handleDelete}
        />

        {/* Diálogos */}
        <RemolqueFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false);
            recargar();
          }}
        />

        <VinculacionDialog
          open={showVinculacionDialog}
          onOpenChange={setShowVinculacionDialog}
          remolque={selectedRemolque}
          onSuccess={() => {
            setShowVinculacionDialog(false);
            setSelectedRemolque(null);
            recargar();
          }}
        />
      </div>
    </ProtectedContent>
  );
}
