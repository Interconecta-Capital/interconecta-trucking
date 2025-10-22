
import { Bell, User, LogOut, Shield, Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlanBadge } from '@/components/common/PlanBadge';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { useNavigate } from 'react-router-dom';
import { useViajeWizardModal } from '@/contexts/ViajeWizardModalProvider';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface GlobalHeaderProps {
  onOpenSidebar?: () => void;
}

export function GlobalHeader({ onOpenSidebar }: GlobalHeaderProps) {
  const { user, signOut } = useAuth();
  const permissions = useUnifiedPermissionsV2();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { openViajeWizard } = useViajeWizardModal();

  const handleNewViaje = () => {
    console.log('[GlobalHeader] 🆕 Iniciando programación de nuevo viaje desde navbar');
    
    // Verificar permisos antes de abrir el wizard - corregido: es una propiedad, no función
    const canCreate = permissions.canCreateCartaPorte;
    if (!canCreate.allowed) {
      toast.error(canCreate.reason || 'No tienes permisos para programar viajes');
      return;
    }
    
    // Abrir el ViajeWizard usando el mismo hook que la página de viajes
    openViajeWizard();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getAlertCount = () => {
    let count = 0;
    
    // Cuenta bloqueada
    if (permissions.accessLevel === 'blocked') count++;
    
    // Plan expirado
    if (permissions.accessLevel === 'expired') count++;
    
    // Trial próximo a expirar
    if (permissions.accessLevel === 'trial') {
      const daysRemaining = permissions.planInfo.daysRemaining || 0;
      if (daysRemaining <= 5) count++;
    }
    
    return count;
  };

  const alertCount = getAlertCount();
  const canCreateViaje = permissions.canCreateCartaPorte;

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isMobile && onOpenSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSidebar}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
            <span className="hidden lg:inline">Sistema de Gestión Logística</span>
            <span className="lg:hidden">Interconecta</span>
          </h1>
          <PlanBadge size="sm" />
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notificaciones */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {alertCount}
              </Badge>
            )}
          </Button>

          {/* Botón Nuevo Viaje - Ahora usa el mismo hook que la página de viajes */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleNewViaje}
                disabled={!canCreateViaje.allowed}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Nuevo Viaje</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {canCreateViaje.allowed ? 'Nuevo Viaje' : canCreateViaje.reason}
            </TooltipContent>
          </Tooltip>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline-block">
                  {user?.email?.split('@')[0] || 'Usuario'}
                </span>
                {permissions.accessLevel === 'superuser' && (
                  <Shield className="h-3 w-3 text-yellow-600" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-gray-500">
                  {permissions.accessLevel === 'superuser' ? 'Superusuario' : permissions.planInfo.name}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
