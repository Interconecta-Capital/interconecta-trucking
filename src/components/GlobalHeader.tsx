
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
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-primary bg-elevated/95 backdrop-blur-xl px-6">
        <SidebarTrigger className="text-tertiary hover:text-primary transition-apple" />
        
        <div className="flex flex-1 items-center gap-4">
          {/* Barra de búsqueda estilo Apple */}
          <form className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-quaternary" />
              <Input
                type="search"
                placeholder={isMobile ? "Buscar..." : "Buscar cartas porte, viajes, vehículos..."}
                className="w-full bg-secondary border-primary rounded-apple pl-10 pr-4 py-3 text-sm placeholder:text-quaternary focus:bg-primary focus:border-focus transition-apple"
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
              <PopoverContent className="w-80 bg-elevated border-primary rounded-apple-lg shadow-apple-lg p-6" align="end">
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary text-lg">Uso Actual</h4>
                  <div className="space-y-3">
                    <LimitUsageIndicator resourceType="cartas_porte" />
                    <LimitUsageIndicator resourceType="conductores" />
                    <LimitUsageIndicator resourceType="vehiculos" />
                    <LimitUsageIndicator resourceType="socios" />
                  </div>
                  <div className="pt-3 border-t border-primary">
                    <Link to="/planes">
                      <Button className="w-full bg-blue-primary hover:bg-blue-hover text-inverse rounded-apple py-3 font-medium transition-apple">
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
            className="bg-blue-primary hover:bg-blue-hover text-inverse rounded-apple px-4 py-2.5 font-medium flex items-center gap-2 transition-apple shadow-apple-sm hover:shadow-apple-md"
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
              className="h-10 w-10 rounded-apple text-tertiary hover:text-primary hover:bg-secondary transition-apple"
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
