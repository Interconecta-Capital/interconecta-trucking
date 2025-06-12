
import {
  Building2,
  Car,
  CreditCard,
  FileText,
  LayoutDashboard,
  Shield,
  Truck,
  Users,
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

export const AppSidebar = () => {
  const location = useLocation();
  const { puedeAccederAdministracion } = usePermisosSubscripcion();

  const isActive = (path: string) => location.pathname === path;

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
              <SidebarMenuButton asChild isActive={isActive('/conductores')} size="default" tooltip="Conductores">
                <Link to="/conductores">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Conductores</span>
                </Link>
              </SidebarMenuButton>
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
