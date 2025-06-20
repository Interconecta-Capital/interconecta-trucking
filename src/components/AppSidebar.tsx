
import {
  Building2,
  Car,
  CreditCard,
  FileText,
  LayoutDashboard,
  Shield,
  Truck,
  Users,
  Route,
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
    <Sidebar variant="inset" collapsible="icon" className="border-r border-primary bg-elevated/95 backdrop-blur-xl">
      <SidebarHeader className="border-b border-primary px-6 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="font-semibold text-primary">
              <div className="flex aspect-square size-8 items-center justify-center rounded-apple bg-blue-primary text-inverse">
                <Truck className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">InterConecta</span>
                <span className="truncate text-xs text-quaternary">Trucking Platform</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-quaternary font-medium text-xs uppercase tracking-wide px-3 py-2">
            Principal
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/dashboard')}
                className={`rounded-apple transition-apple ${
                  isActive('/dashboard') 
                    ? 'bg-blue-primary text-inverse shadow-apple-sm' 
                    : 'text-secondary hover:bg-secondary hover:text-primary'
                }`}
              >
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/viajes')}
                className={`rounded-apple transition-apple ${
                  isActive('/viajes') 
                    ? 'bg-blue-primary text-inverse shadow-apple-sm' 
                    : 'text-secondary hover:bg-secondary hover:text-primary'
                }`}
              >
                <Link to="/viajes" className="flex items-center gap-3 px-3 py-2.5">
                  <Route className="h-4 w-4" />
                  <span className="font-medium">Viajes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/cartas-porte')}
                className={`rounded-apple transition-apple ${
                  isActive('/cartas-porte') 
                    ? 'bg-blue-primary text-inverse shadow-apple-sm' 
                    : 'text-secondary hover:bg-secondary hover:text-primary'
                }`}
              >
                <Link to="/cartas-porte" className="flex items-center gap-3 px-3 py-2.5">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Cartas Porte</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-quaternary font-medium text-xs uppercase tracking-wide px-3 py-2 mt-6">
            Recursos
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/vehiculos')}
                className={`rounded-apple transition-apple ${
                  isActive('/vehiculos') 
                    ? 'bg-blue-primary text-inverse shadow-apple-sm' 
                    : 'text-secondary hover:bg-secondary hover:text-primary'
                }`}
              >
                <Link to="/vehiculos" className="flex items-center gap-3 px-3 py-2.5">
                  <Car className="h-4 w-4" />
                  <span className="font-medium">Vehículos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/conductores')}
                className={`rounded-apple transition-apple ${
                  isActive('/conductores') 
                    ? 'bg-blue-primary text-inverse shadow-apple-sm' 
                    : 'text-secondary hover:bg-secondary hover:text-primary'
                }`}
              >
                <Link to="/conductores" className="flex items-center gap-3 px-3 py-2.5">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Conductores</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/socios')}
                className={`rounded-apple transition-apple ${
                  isActive('/socios') 
                    ? 'bg-blue-primary text-inverse shadow-apple-sm' 
                    : 'text-secondary hover:bg-secondary hover:text-primary'
                }`}
              >
                <Link to="/socios" className="flex items-center gap-3 px-3 py-2.5">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">Socios</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-quaternary font-medium text-xs uppercase tracking-wide px-3 py-2 mt-6">
            Sistema
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/planes')}
                className={`rounded-apple transition-apple ${
                  isActive('/planes') 
                    ? 'bg-blue-primary text-inverse shadow-apple-sm' 
                    : 'text-secondary hover:bg-secondary hover:text-primary'
                }`}
              >
                <Link to="/planes" className="flex items-center gap-3 px-3 py-2.5">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">Planes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {puedeAccederAdministracion && (
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive('/administracion')}
                  className={`rounded-apple transition-apple ${
                    isActive('/administracion') 
                      ? 'bg-blue-primary text-inverse shadow-apple-sm' 
                      : 'text-secondary hover:bg-secondary hover:text-primary'
                  }`}
                >
                  <Link to="/administracion" className="flex items-center gap-3 px-3 py-2.5">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Administración</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-primary p-3">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
