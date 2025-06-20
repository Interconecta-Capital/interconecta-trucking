import {
  Building2,
  Car,
  CreditCard,
  FileText,
  LayoutDashboard,
  Shield,
  Truck,
  Users,
  Plus,
  Lock,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { UserMenu } from "@/components/UserMenu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePermisosSubscripcion } from '@/hooks/usePermisosSubscripcion';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { useTrialManager } from '@/hooks/useTrialManager';
import { Badge } from "@/components/ui/badge";

export const AppSidebar = () => {
  const location = useLocation();
  const { puedeAccederAdministracion } = usePermisosSubscripcion();
  const { isSuperuser, hasFullAccess } = useEnhancedPermissions();
  const { canPerformAction } = useTrialManager();

  const isActive = (path: string) => location.pathname === path;

  // Verificar si puede crear cartas porte
  const canCreateCartaPorte = isSuperuser || (hasFullAccess && canPerformAction('create'));
  
  // Verificar si puede acceder a funciones de conductores
  const canAccessConductores = isSuperuser || hasFullAccess;

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Truck className="size-6" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold text-base">Interconecta</span>
                  <span className="truncate text-sm">Sistema de Gestión</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium">Navegación Principal</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/dashboard')} size="default" tooltip="Dashboard">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="text-sm">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              {canCreateCartaPorte ? (
                <SidebarMenuButton asChild isActive={isActive('/carta-porte/editor')} size="default" tooltip="Nueva Carta Porte">
                  <Link to="/carta-porte/editor">
                    <Plus className="h-5 w-5" />
                    <span className="text-sm">Nueva Carta Porte</span>
                  </Link>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton 
                  disabled 
                  size="default" 
                  tooltip="Acceso Restringido"
                  className="opacity-50 cursor-not-allowed"
                >
                  <Lock className="h-5 w-5" />
                  <span className="text-sm">Nueva Carta Porte</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Bloqueado
                  </Badge>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/cartas-porte')} size="default" tooltip="Cartas Porte">
                <Link to="/cartas-porte">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">Cartas Porte</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/viajes')} size="default" tooltip="Viajes">
                <Link to="/viajes">
                  <Truck className="h-5 w-5" />
                  <span className="text-sm">Viajes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium">Gestión de Recursos</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/vehiculos')} size="default" tooltip="Vehículos">
                <Link to="/vehiculos">
                  <Car className="h-5 w-5" />
                  <span className="text-sm">Vehículos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              {canAccessConductores ? (
                <SidebarMenuButton asChild isActive={isActive('/conductores')} size="default" tooltip="Conductores">
                  <Link to="/conductores">
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Conductores</span>
                  </Link>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton 
                  disabled 
                  size="default" 
                  tooltip="Acceso Restringido"
                  className="opacity-50 cursor-not-allowed"
                >
                  <Lock className="h-5 w-5" />
                  <span className="text-sm">Conductores</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Bloqueado
                  </Badge>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/socios')} size="default" tooltip="Socios">
                <Link to="/socios">
                  <Building2 className="h-5 w-5" />
                  <span className="text-sm">Socios</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {puedeAccederAdministracion().puede && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-medium">Administración</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/administracion')} size="default" tooltip="Administración">
                  <Link to="/administracion">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm">Administración</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium">Configuración</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/planes')} size="default" tooltip="Planes">
                <Link to="/planes">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-sm">Planes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
