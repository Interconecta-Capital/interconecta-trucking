
import { Building2, Car, FileText, Route, Settings, TrendingUp, Users, Wrench } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';

interface SidebarItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  requiresPermission?: string;
}

const sidebarItems: SidebarItem[] = [
  { title: 'Viajes', href: '/viajes', icon: Route, requiresPermission: 'viajes' },
  { title: 'Vehículos', href: '/vehiculos', icon: Car, requiresPermission: 'vehiculos' },
  { title: 'Conductores', href: '/conductores', icon: Users, requiresPermission: 'conductores' },
  { title: 'Socios', href: '/socios', icon: Building2, requiresPermission: 'socios' },
  { title: 'Remolques', href: '/remolques', icon: Wrench, requiresPermission: 'vehiculos' },
  { title: 'Carta Porte', href: '/carta-porte', icon: FileText, requiresPermission: 'cartas_porte' },
  { title: 'Configuración', href: '/configuracion', icon: Settings }
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

    // Durante trial activo, acceso total
    if (permissions.accessLevel === 'trial') {
      return true;
    }

    // Con plan activo, verificar acceso completo
    if (permissions.accessLevel === 'paid') {
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
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Interconecta</h2>
        {permissions.accessLevel === 'superuser' && (
          <Badge variant="default" className="mt-2 bg-yellow-100 text-yellow-800">
            Superusuario
          </Badge>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const canAccess = canAccessItem(item);
          const badge = getItemBadge(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : canAccess 
                    ? 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </div>
              {badge && (
                <Badge variant="outline" className="text-xs">
                  {badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Plan Status */}
      <div className="p-4 border-t border-gray-200">
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
      </div>
    </div>
  );
}
