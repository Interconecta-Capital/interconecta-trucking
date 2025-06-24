
import { useState } from 'react';
import { Plus, Navigation, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ViajesActivos } from '@/components/viajes/ViajesActivos';
import { ViajesHistorial } from '@/components/viajes/ViajesHistorial';
import { useViajeWizardModal } from '@/contexts/ViajeWizardModalProvider';
import { useViajes } from '@/hooks/useViajes';
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';
import { ProtectedContent } from '@/components/ProtectedContent';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { toast } from 'sonner';

export default function ViajesOptimized() {
  const { viajes, isLoading } = useViajes();
  const permissions = useUnifiedPermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('activos');
  const { openViajeWizard } = useViajeWizardModal();

  const handleNewViaje = () => {
    console.log('[Viajes] 🆕 Iniciando programación de nuevo viaje');
    
    // Verificar permisos antes de abrir el wizard
    const permissionCheck = permissions.canCreateViaje;
    if (!permissionCheck.allowed) {
      toast.error(permissionCheck.reason || 'No tienes permisos para programar viajes');
      return;
    }
    
    // Abrir el ViajeWizard en modal
    openViajeWizard();
  };

  const canCreateViaje = permissions.canCreateViaje;
  
  const viajesActivos = viajes.filter(v => ['programado', 'en_transito', 'retrasado'].includes(v.estado));
  const viajesCompletados = viajes.filter(v => ['completado', 'cancelado'].includes(v.estado));

  return (
    <ProtectedContent requiredFeature="viajes">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header con botón de creación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-light">
              <Navigation className="h-6 w-6 text-blue-interconecta" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Viajes</h1>
              <p className="text-sm text-gray-600 mt-1">Gestiona y monitorea tus viajes</p>
            </div>
          </div>
          
          <Button 
            onClick={handleNewViaje} 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            disabled={!canCreateViaje.allowed}
          >
            <Plus className="h-5 w-5" />
            Programar Viaje
          </Button>
        </div>

        {!canCreateViaje.allowed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">{canCreateViaje.reason}</p>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 bg-gray-05 p-4 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-50 h-4 w-4" />
            <Input
              placeholder="Buscar por origen, destino o carta porte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-0 bg-pure-white shadow-sm"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-light to-blue-interconecta/10 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-interconecta">Total Viajes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-interconecta">{viajes.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-700">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">{viajesActivos.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-purple-700">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-700">{viajesCompletados.length}</p>
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

        {/* Tabs de viajes */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activos">Viajes Activos ({viajesActivos.length})</TabsTrigger>
            <TabsTrigger value="historial">Historial ({viajesCompletados.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activos" className="space-y-4">
            <ViajesActivos searchTerm={searchTerm} />
          </TabsContent>
          
          <TabsContent value="historial" className="space-y-4">
            <ViajesHistorial searchTerm={searchTerm} />
          </TabsContent>
        </Tabs>

      </div>
    </ProtectedContent>
  );
}
