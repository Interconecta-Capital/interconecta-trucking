
import { useState } from 'react';
import { Plus, Truck, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ViajesActivos } from '@/components/viajes/ViajesActivos';
import { HistorialViajes } from '@/components/viajes/HistorialViajes';
import { ProgramacionViajes } from '@/components/viajes/ProgramacionViajes';
import { DocumentosVista } from '@/components/viajes/DocumentosVista';
import { ProgramarViajeModal } from '@/components/viajes/modals/ProgramarViajeModal';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';

export default function Viajes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showProgramarModal, setShowProgramarModal] = useState(false);
  const [activeTab, setActiveTab] = useState('activos');

  const handleNuevoViaje = () => {
    setShowProgramarModal(true);
  };

  return (
    <ProtectedContent requiredFeature="viajes">
      <div className="container mx-auto py-6 space-y-6">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Gestión de Viajes</h1>
          </div>
          <ProtectedActions
            action="create"
            resource="viajes"
            onAction={handleNuevoViaje}
            buttonText="Programar Viaje"
          />
        </div>

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitUsageIndicator resourceType="viajes" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar viajes..."
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
        </div>

        {/* Tabs de viajes */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activos">Viajes Activos</TabsTrigger>
            <TabsTrigger value="programados">Programados</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="activos">
            <ViajesActivos searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="programados">
            <ProgramacionViajes searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="historial">
            <HistorialViajes searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="documentos">
            <DocumentosVista searchTerm={searchTerm} />
          </TabsContent>
        </Tabs>

        {/* Modal de programar viaje */}
        <ProgramarViajeModal
          open={showProgramarModal}
          onOpenChange={setShowProgramarModal}
        />
      </div>
    </ProtectedContent>
  );
}
