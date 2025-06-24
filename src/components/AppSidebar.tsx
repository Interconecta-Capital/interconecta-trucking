
import { useState, useEffect } from 'react';
import {
  Building2,
  Car,
  FileText,
  Route,
  Settings,
  TrendingUp,
  Users,
  Wrench,
  LayoutDashboard,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  requiresPermission?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Viajes', href: '/viajes', icon: Route, requiresPermission: true },
  { title: 'Vehículos', href: '/vehiculos', icon: Car, requiresPermission: true },
  { title: 'Conductores', href: '/conductores', icon: Users, requiresPermission: true },
  { title: 'Socios', href: '/socios', icon: Building2, requiresPermission: true },
  { title: 'Remolques', href: '/remolques', icon: Wrench, requiresPermission: true },
  { title: 'Carta Porte', href: '/cartas-porte', icon: FileText, requiresPermission: true },
  { title: 'Planes', href: '/planes', icon: CreditCard },
  { title: 'Configuración', href: '/configuracion/empresa', icon: Settings }
];

interface AppSidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export function AppSidebar({ isMobileOpen = false, setIsMobileOpen }: AppSidebarProps) {
  const location = useLocation();
  const permissions = useUnifiedPermissionsV2();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem('sidebarCollapsed') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  const canAccessItem = (item: SidebarItem): boolean => {
    // Superusuarios pueden acceder a todo
    if (permissions.accessLevel === 'superuser') {
      return true;
    }

    // Si no requiere permisos específicos, permitir acceso
    if (!item.requiresPermission) {
      return true;
    }

    // Con plan activo (trial o paid), acceso completo
    if (permissions.accessLevel === 'trial' || permissions.accessLevel === 'paid') {
      return permissions.hasFullAccess;
    }

    // Sin acceso en otros casos
    return false;
  };

  const getItemBadge = (item: SidebarItem): string | undefined => {
    if (permissions.accessLevel === 'superuser') {
      return undefined; // Superusuarios no ven badges
    }

    if (permissions.accessLevel === 'trial') {
      return 'Trial';
    }

    if (!canAccessItem(item)) {
      return 'Pro';
    }

    return undefined;
  };

  const sidebarBody = (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Interconecta</h2>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen?.(false)}
            className="md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
        {!isMobile && permissions.accessLevel === 'superuser' && (
          <Badge variant="default" className="ml-2 bg-yellow-100 text-yellow-800">
            Superusuario
          </Badge>
        )}
      </div>

      <nav className="flex-1 px-2 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const canAccess = canAccessItem(item);
          const badge = getItemBadge(item);
          const Icon = item.icon;

          const linkClasses = `
            flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActive
              ? 'bg-blue-50 text-blue-700'
              : canAccess
                ? 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                : 'text-gray-400 cursor-not-allowed'}
          `;

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link to={item.href} className={linkClasses}>
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </div>
                  {badge && !isCollapsed && (
                    <Badge variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  )}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="capitalize">
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-3">
        {permissions.accessLevel === 'superuser' && isMobile && (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            Superusuario
          </Badge>
        )}
        
        {permissions.accessLevel === 'trial' && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-orange-800">Período de Prueba</p>
            <p className="text-xs text-orange-600">
              {permissions.planInfo.daysRemaining || 0} días restantes
            </p>
          </div>
        )}

        {(permissions.accessLevel === 'blocked' || permissions.accessLevel === 'expired') && (
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-red-800">
              {permissions.accessLevel === 'blocked' ? 'Cuenta Bloqueada' : 'Plan Expirado'}
            </p>
            <Button size="sm" className="mt-2 w-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              Renovar Plan
            </Button>
          </div>
        )}

        {permissions.accessLevel === 'paid' && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-800">Plan Activo</p>
            <p className="text-xs text-green-600">{permissions.planInfo.name}</p>
          </div>
        )}

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full justify-center mt-2"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {!isMobile && (
        <motion.aside
          className="hidden md:flex bg-white border-r border-gray-200 h-full"
          animate={{ width: isCollapsed ? 80 : 256 }}
          transition={{ duration: 0.25 }}
        >
          {sidebarBody}
        </motion.aside>
      )}

      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen?.(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 w-64"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.25 }}
            >
              {sidebarBody}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
