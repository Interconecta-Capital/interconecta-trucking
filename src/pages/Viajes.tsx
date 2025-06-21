
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
import { SectionHeader } from '@/components/ui/section-header';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Viajes() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header estilo Apple responsivo */}
        <SectionHeader
          title="Centro de Operaciones"
          description="Gestiona tus viajes y documentos logísticos"
          icon={Truck}
          className="mb-6 sm:mb-8"
          data-onboarding="viajes-header"
        >
          <div className={`flex gap-3 ${isMobile ? 'flex-col w-full' : 'flex-row'}`}>
            <Button 
              variant="outline" 
              onClick={handleNuevaCartaPorte}
              className={`flex items-center gap-2 ${isMobile ? 'h-12 w-full justify-center' : ''}`}
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
                className={`flex items-center gap-2 ${isMobile ? 'h-12 w-full justify-center' : ''}`}
                data-onboarding="nuevo-viaje-btn"
              >
                <Route className="h-4 w-4" />
                Programar Nuevo Viaje
              </Button>
            </ProtectedActions>
          </div>
        </SectionHeader>

        {/* Indicador de límites responsivo */}
        <ResponsiveGrid cols={{ default: 1, md: 3 }} gap={{ default: 4, md: 6 }}>
          <div className="md:col-span-2">
            <LimitUsageIndicator resourceType="cartas_porte" />
          </div>
        </ResponsiveGrid>

        {/* Filtros y búsqueda responsivos */}
        <div className={`flex gap-4 bg-gray-05 p-4 rounded-2xl ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-50 h-4 w-4" />
            <Input
              placeholder="Buscar viajes por destino, conductor o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-12 border-0 bg-pure-white shadow-sm ${isMobile ? 'h-12 text-base' : 'h-12'}`}
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`bg-pure-white shadow-sm border-0 ${isMobile ? 'h-12 w-full justify-center' : 'h-12 px-6'}`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Tabs de viajes responsivos */}
        <div className="bg-pure-white rounded-2xl border border-gray-20 shadow-sm overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className={`border-b border-gray-10 bg-gray-05 ${isMobile ? 'p-4' : 'px-6 py-4'}`}>
              <TabsList 
                className={`grid w-full grid-cols-4 bg-gray-10 rounded-xl p-1 ${isMobile ? 'h-14' : 'h-12 max-w-2xl'}`}
                data-onboarding="viajes-tabs"
              >
                <TabsTrigger 
                  value="activos"
                  className={`rounded-lg font-medium data-[state=active]:bg-pure-white data-[state=active]:text-gray-90 data-[state=active]:shadow-sm text-gray-60 ${isMobile ? 'text-xs py-3' : 'text-sm'}`}
                >
                  {isMobile ? 'Activos' : 'Viajes Activos'}
                </TabsTrigger>
                <TabsTrigger 
                  value="programados"
                  className={`rounded-lg font-medium data-[state=active]:bg-pure-white data-[state=active]:text-gray-90 data-[state=active]:shadow-sm text-gray-60 ${isMobile ? 'text-xs py-3' : 'text-sm'}`}
                >
                  {isMobile ? 'Program.' : 'Programados'}
                </TabsTrigger>
                <TabsTrigger 
                  value="historial"
                  className={`rounded-lg font-medium data-[state=active]:bg-pure-white data-[state=active]:text-gray-90 data-[state=active]:shadow-sm text-gray-60 ${isMobile ? 'text-xs py-3' : 'text-sm'}`}
                >
                  Historial
                </TabsTrigger>
                <TabsTrigger 
                  value="documentos"
                  data-onboarding="documentos-tab"
                  className={`rounded-lg font-medium data-[state=active]:bg-pure-white data-[state=active]:text-gray-90 data-[state=active]:shadow-sm text-gray-60 ${isMobile ? 'text-xs py-3' : 'text-sm'}`}
                >
                  {isMobile ? 'Docs' : 'Documentos'}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className={isMobile ? 'p-4' : 'p-6'}>
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
        </div>

        {/* Modal de programar viaje */}
        <ProgramarViajeModal
          open={showProgramarModal}
          onOpenChange={setShowProgramarModal}
        />
      </div>
    </ProtectedContent>
  );
}
