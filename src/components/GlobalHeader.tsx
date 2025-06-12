
import { Bell, Plus, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserMenu } from './UserMenu';
import { SettingsDialog } from './SettingsDialog';
import { PlanBadge } from './PlanBadge';
import { ScheduleDropdown } from './ScheduleDropdown';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LimitUsageIndicator } from './LimitUsageIndicator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTrialTracking } from '@/hooks/useTrialTracking';
import { useSuscripcion } from '@/hooks/useSuscripcion';

export function GlobalHeader() {
  const [showSettings, setShowSettings] = useState(false);
  const isMobile = useIsMobile();
  const { trialInfo } = useTrialTracking();
  const { suscripcion, enPeriodoPrueba } = useSuscripcion();

  // En móvil, ocultar PlanBadge si está en período de prueba
  const shouldShowPlanBadge = !isMobile || 
    (!trialInfo.isTrialActive && !enPeriodoPrueba() && suscripcion?.status !== 'trial');

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      
      <div className="flex flex-1 items-center gap-2">
        {/* Logo/Título - Solo icono en móvil */}
        <div className="flex items-center">
          {isMobile ? (
            <div className="flex justify-center flex-1 ml-4">
              <img 
                src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
                alt="Interconecta Trucking"
                className="h-8 w-8 rounded-lg"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-3 mr-4">
              <img 
                src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
                alt="Interconecta Trucking Logo"
                className="h-8 w-8 rounded-lg"
              />
              <h1 className="text-lg font-bold font-sora text-interconecta-primary">
                Interconecta Trucking
              </h1>
            </div>
          )}
        </div>

        {/* Barra de búsqueda - Optimizada para móvil */}
        <form className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={isMobile ? "Buscar..." : "Buscar cartas porte, clientes, vehículos..."}
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Plan Badge con indicador de límites - Condicional para móvil */}
        {shouldShowPlanBadge && (
          <Popover>
            <PopoverTrigger asChild>
              <div className="cursor-pointer">
                <PlanBadge />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-3">
                <h4 className="font-medium">Uso Actual</h4>
                <div className="space-y-3">
                  <LimitUsageIndicator resource="cartas_porte" />
                  <LimitUsageIndicator resource="conductores" />
                  <LimitUsageIndicator resource="vehiculos" />
                  <LimitUsageIndicator resource="socios" />
                </div>
                <div className="pt-2 border-t">
                  <Link to="/planes">
                    <Button size="sm" className="w-full">
                      Ver Planes
                    </Button>
                  </Link>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        <Link to="/cartas-porte">
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Viaje</span>
          </Button>
        </Link>
        
        {!isMobile && <ScheduleDropdown />}
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notificaciones</span>
        </Button>
        
        {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
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
  );
}
