
import { Building2, Car, FileText, Route, Settings, TrendingUp, Users, Wrench, LayoutDashboard, CreditCard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

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

export function AppSidebar() {
  const location = useLocation();
  const permissions = useUnifiedPermissionsV2();

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

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Interconecta</h2>
        {permissions.accessLevel === 'superuser' && (
          <Badge variant="default" className="mt-2 bg-yellow-100 text-yellow-800">
            Superusuario
          </Badge>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                const canAccess = canAccessItem(item);
                const badge = getItemBadge(item);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        to={item.href}
                        className={`
                          flex items-center justify-between w-full
                          ${canAccess 
                            ? 'text-gray-700' 
                            : 'text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                        {badge && (
                          <Badge variant="outline" className="text-xs ml-auto">
                            {badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
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
      </SidebarFooter>
    </Sidebar>
  );
}
