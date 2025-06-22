
import { Building2, Car, FileText, Route, Settings, TrendingUp, Users, Wrench, Minus, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // DEBUGGING CRÍTICO - Logs detallados para auditoría del sidebar
  console.group('[AppSidebar] 🔍 AUDITORÍA COMPLETA DE NAVEGACIÓN');
  console.log('📊 Estado completo de permisos en sidebar:', {
    userId: permissions.userId,
    isAuthenticated: permissions.isAuthenticated,
    accessLevel: permissions.accessLevel,
    accessReason: permissions.accessReason,
    hasFullAccess: permissions.hasFullAccess
  });

  const canAccessItem = (item: SidebarItem): boolean => {
    console.log(`[AppSidebar] 🔍 Evaluando acceso para "${item.title}":`);
    
    // Superusuarios pueden acceder a todo
    if (permissions.accessLevel === 'superuser') {
      console.log(`[AppSidebar] ✅ SUPERUSUARIO - Acceso total a "${item.title}"`);
      return true;
    }

    // Si no requiere permisos específicos, permitir acceso
    if (!item.requiresPermission) {
      console.log(`[AppSidebar] ✅ Sin permisos requeridos - Acceso permitido a "${item.title}"`);
      return true;
    }

    // Durante trial activo, acceso total
    if (permissions.accessLevel === 'trial') {
      console.log(`[AppSidebar] ✅ TRIAL ACTIVO - Acceso total a "${item.title}"`);
      return true;
    }

    // Con plan activo, verificar acceso completo
    if (permissions.accessLevel === 'paid') {
      console.log(`[AppSidebar] 🔍 PLAN PAGADO - Verificando hasFullAccess (${permissions.hasFullAccess}) para "${item.title}"`);
      return permissions.hasFullAccess;
    }

    // Sin acceso en otros casos
    console.log(`[AppSidebar] ❌ SIN ACCESO a "${item.title}" - AccessLevel: ${permissions.accessLevel}`);
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

  // Log de elementos del sidebar y su acceso
  console.log('📋 Evaluación de acceso por elemento:');
  sidebarItems.forEach(item => {
    const access = canAccessItem(item);
    const badge = getItemBadge(item);
    console.log(`  - ${item.title}: ${access ? '✅ ACCESO' : '❌ BLOQUEADO'} ${badge ? `[${badge}]` : ''}`);
  });
  console.groupEnd();

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with collapse button */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gray-900">Interconecta</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </Button>
        </div>
        
        {!isCollapsed && permissions.accessLevel === 'superuser' && (
          <Badge variant="default" className="mt-2 bg-yellow-100 text-yellow-800">
            Superusuario
          </Badge>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const canAccess = canAccessItem(item);
          const badge = getItemBadge(item);
          const Icon = item.icon;

          // Log individual de renderizado
          console.log(`[AppSidebar] 🎨 Renderizando "${item.title}": ${canAccess ? 'VISIBLE' : 'OCULTO/DESHABILITADO'}`);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-gray-50 hover:scale-[1.02]",
                isActive && "bg-blue-50 text-blue-700 shadow-sm",
                !isActive && canAccess && "text-gray-700 hover:text-gray-900",
                !canAccess && "text-gray-400 cursor-not-allowed",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {badge && (
                    <Badge variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Plan Status Footer */}
      {!isCollapsed && (
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
              <Link to="/planes">
                <Button size="sm" className="mt-2 w-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Renovar Plan
                </Button>
              </Link>
            </div>
          )}

          {permissions.accessLevel === 'paid' && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800">Plan Activo</p>
              <p className="text-xs text-green-600">{permissions.planInfo.name}</p>
            </div>
          )}

          {permissions.accessLevel === 'superuser' && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">Superusuario</p>
              <p className="text-xs text-yellow-600">Acceso total al sistema</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
