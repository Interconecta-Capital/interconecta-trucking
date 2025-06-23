
import { useState } from 'react';
import { Plus, Route, Filter, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { ProtectedContent } from '@/components/ProtectedContent';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { ViajesActivos } from '@/components/viajes/ViajesActivos';
import { HistorialViajes } from '@/components/viajes/HistorialViajes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function ViajesOptimized() {
  const navigate = useNavigate();
  const permissions = useUnifiedPermissionsV2();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleNewViaje = () => {
    console.log('[Viajes] 🆕 Iniciando creación de nuevo viaje');
    
    // Verificar permisos antes de navegar
    const permissionCheck = permissions.canCreateCartaPorte; // Los viajes requieren crear carta porte
    if (!permissionCheck.allowed) {
      toast.error(permissionCheck.reason || 'No tienes permisos para crear viajes');
      return;
    }
    
    navigate('/viajes/programar');
  };

  const canCreateViaje = permissions.canCreateCartaPorte; // Los viajes requieren crear carta porte

  return (
    <ProtectedContent requiredFeature="viajes">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header con botón de creación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-light">
              <Route className="h-6 w-6 text-blue-interconecta" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Viajes</h1>
              <p className="text-sm text-gray-600 mt-1">Gestiona y programa tus viajes</p>
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
              placeholder="Buscar viajes por destino, conductor o vehículo..."
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
        </div>

        {/* Tabs de contenido */}
        <Tabs defaultValue="activos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activos" className="flex items-center gap-2">
              <Route className="h-4 w-4" />
              Viajes Activos
            </TabsTrigger>
            <TabsTrigger value="historial" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activos" className="space-y-6">
            <ViajesActivos searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="historial" className="space-y-6">
            <HistorialViajes searchTerm={searchTerm} />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedContent>
  );
}
