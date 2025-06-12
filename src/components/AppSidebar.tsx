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
  SidebarProvider,
} from "@/components/ui/sidebar"
import { usePermisosSubscripcion } from '@/hooks/usePermisosSubscripcion';
import { ProtectedFeature } from '@/components/ProtectedFeature';

export const AppSidebar = () => {
  const location = useLocation();
  const { puedeAccederAdministracion } = usePermisosSubscripcion();

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Truck className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">TransportePro</span>
                    <span className="truncate text-xs">Sistema de Gestión</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/cartas-porte')}>
                  <Link to="/cartas-porte">
                    <FileText className="h-4 w-4" />
                    <span>Cartas Porte</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/viajes')}>
                  <Link to="/viajes">
                    <Truck className="h-4 w-4" />
                    <span>Viajes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Gestión de Recursos</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/vehiculos')}>
                  <Link to="/vehiculos">
                    <Car className="h-4 w-4" />
                    <span>Vehículos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/conductores')}>
                  <Link to="/conductores">
                    <Users className="h-4 w-4" />
                    <span>Conductores</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/socios')}>
                  <Link to="/socios">
                    <Building2 className="h-4 w-4" />
                    <span>Socios</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {puedeAccederAdministracion().puede && (
            <SidebarGroup>
              <SidebarGroupLabel>Administración</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/administracion')}>
                    <Link to="/administracion">
                      <Shield className="h-4 w-4" />
                      <span>Administración</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel>Configuración</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/planes')}>
                  <Link to="/planes">
                    <CreditCard className="h-4 w-4" />
                    <span>Planes</span>
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
    </SidebarProvider>
  );
};
