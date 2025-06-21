
import { Bell, Plus, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserMenu } from './UserMenu';
import { SettingsDialog } from './SettingsDialog';
import { PlanBadge } from './PlanBadge';
import { ScheduleDropdown } from './ScheduleDropdown';
import { NotificationsPopover } from './dashboard/NotificationsPopover';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LimitUsageIndicator } from './LimitUsageIndicator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTrialTracking } from '@/hooks/useTrialTracking';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { useNavigate } from 'react-router-dom';

export function GlobalHeader() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const isMobile = useIsMobile();
  const { trialInfo } = useTrialTracking();
  const { suscripcion, enPeriodoPrueba } = useSuscripcion();

  // En móvil, ocultar PlanBadge si está en período de prueba
  const shouldShowPlanBadge = !isMobile || 
    (!trialInfo.isTrialActive && !enPeriodoPrueba() && suscripcion?.status !== 'trial');

  const handleNuevoViaje = () => {
    navigate('/viajes/programar');
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-20 bg-pure-white/95 backdrop-blur-premium px-6">
        <SidebarTrigger className="text-gray-60 hover:text-gray-90 transition-colors duration-200" />
        
        <div className="flex flex-1 items-center gap-4">
          {/* Barra de búsqueda estilo Apple */}
          <form className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-50" />
              <Input
                type="search"
                placeholder={isMobile ? "Buscar..." : "Buscar cartas porte, viajes, vehículos..."}
                className="w-full bg-gray-05 border-gray-20 rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-50 focus:bg-pure-white focus:border-blue-interconecta focus:ring-1 focus:ring-blue-interconecta transition-all duration-200"
              />
            </div>
          </form>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Plan Badge con indicador de límites - Condicional para móvil */}
          {shouldShowPlanBadge && (
            <Popover>
              <PopoverTrigger asChild>
                <div className="cursor-pointer">
                  <PlanBadge />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-pure-white border-gray-20 rounded-2xl shadow-lg p-6" align="end">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-90 text-lg">Uso Actual</h4>
                  <div className="space-y-3">
                    <LimitUsageIndicator resourceType="cartas_porte" />
                    <LimitUsageIndicator resourceType="conductores" />
                    <LimitUsageIndicator resourceType="vehiculos" />
                    <LimitUsageIndicator resourceType="socios" />
                  </div>
                  <div className="pt-3 border-t border-gray-20">
                    <Link to="/planes">
                      <Button className="w-full bg-blue-interconecta hover:bg-blue-hover text-pure-white rounded-xl py-3 font-medium transition-all duration-200">
                        Ver Planes
                      </Button>
                    </Link>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <Button 
            onClick={handleNuevoViaje}
            className="bg-blue-interconecta hover:bg-blue-hover text-pure-white rounded-xl px-4 py-2.5 font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Viaje</span>
          </Button>
          
          {/* ScheduleDropdown - Ahora visible en móvil también */}
          <ScheduleDropdown />
          
          {/* Notificaciones */}
          <NotificationsPopover />
          
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl text-gray-60 hover:text-gray-90 hover:bg-gray-05 transition-all duration-200"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Configuración</span>
            </Button>
          )}
          
          <UserMenu />
        </div>
        
        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      </header>
    </>
  );
}
