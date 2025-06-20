
import { useState } from 'react';
import { Plus, Truck, Filter, Search, Route, FileText } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';

export default function Viajes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showProgramarModal, setShowProgramarModal] = useState(false);
  const [activeTab, setActiveTab] = useState('activos');

  const handleNuevoViaje = () => {
    navigate('/viajes/programar');
  };

  const handleNuevaCartaPorte = () => {
    navigate('/carta-porte/editor');
  };

  return (
    <ProtectedContent requiredFeature="viajes">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header estilo Apple */}
        <div className="flex items-center justify-between" data-onboarding="viajes-header">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-interconecta rounded-2xl">
              <Truck className="h-6 w-6 text-pure-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-90 tracking-tight">Centro de Operaciones</h1>
              <p className="text-gray-60 mt-1">Gestiona tus viajes y documentos logísticos</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleNuevaCartaPorte}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Nueva Carta Porte
            </Button>
            <ProtectedActions
              action="create"
              resource="cartas_porte"
              onAction={handleNuevoViaje}
            >
              <Button 
                onClick={handleNuevoViaje}
                className="flex items-center gap-2"
                data-onboarding="nuevo-viaje-btn"
              >
                <Route className="h-4 w-4" />
                Programar Nuevo Viaje
              </Button>
            </ProtectedActions>
          </div>
        </div>

        {/* Indicador de límites estilo Apple */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitUsageIndicator resourceType="cartas_porte" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda estilo Apple */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-50 h-4 w-4" />
            <Input
              placeholder="Buscar viajes por destino, conductor o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-6"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Tabs de viajes estilo Apple */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList 
            className="grid w-full grid-cols-4 bg-gray-05 rounded-2xl p-1 h-12" 
            data-onboarding="viajes-tabs"
          >
            <TabsTrigger 
              value="activos"
              className="rounded-xl text-sm font-medium data-[state=active]:bg-pure-white data-[state=active]:text-gray-90 data-[state=active]:shadow-sm text-gray-60"
            >
              Viajes Activos
            </TabsTrigger>
            <TabsTrigger 
              value="programados"
              className="rounded-xl text-sm font-medium data-[state=active]:bg-pure-white data-[state=active]:text-gray-90 data-[state=active]:shadow-sm text-gray-60"
            >
              Programados
            </TabsTrigger>
            <TabsTrigger 
              value="historial"
              className="rounded-xl text-sm font-medium data-[state=active]:bg-pure-white data-[state=active]:text-gray-90 data-[state=active]:shadow-sm text-gray-60"
            >
              Historial
            </TabsTrigger>
            <TabsTrigger 
              value="documentos"
              data-onboarding="documentos-tab"
              className="rounded-xl text-sm font-medium data-[state=active]:bg-pure-white data-[state=active]:text-gray-90 data-[state=active]:shadow-sm text-gray-60"
            >
              Documentos
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="activos" className="mt-0">
              <ViajesActivos />
            </TabsContent>

            <TabsContent value="programados" className="mt-0">
              <ProgramacionViajes />
            </TabsContent>

            <TabsContent value="historial" className="mt-0">
              <HistorialViajes />
            </TabsContent>

            <TabsContent value="documentos" className="mt-0">
              <DocumentosVista />
            </TabsContent>
          </div>
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
