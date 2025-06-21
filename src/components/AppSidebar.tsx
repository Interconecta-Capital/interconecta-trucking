
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
  useSidebar,
} from "@/components/ui/sidebar"
import { usePermisosSubscripcion } from '@/hooks/usePermisosSubscripcion';

export const AppSidebar = () => {
  const location = useLocation();
  const { puedeAccederAdministracion } = usePermisosSubscripcion();
  const { state } = useSidebar();

  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar 
      variant="inset" 
      collapsible="icon" 
      className="border-r border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm"
    >
      <SidebarHeader className="border-b border-gray-100 px-4 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              className="font-semibold text-gray-900 hover:bg-gray-50 data-[state=open]:bg-gray-50"
              tooltip={isCollapsed ? "InterConecta" : undefined}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <Truck className="size-4" />
              </div>
              {!isCollapsed && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-gray-900">InterConecta</span>
                  <span className="truncate text-xs text-gray-500">Trucking Platform</span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium text-xs uppercase tracking-wide px-3 py-2">
            Principal
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/dashboard')}
                className={`rounded-lg transition-all duration-200 ${
                  isActive('/dashboard') 
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                tooltip={isCollapsed ? "Dashboard" : undefined}
              >
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 min-w-0">
                  <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium truncate">Dashboard</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/viajes')}
                className={`rounded-lg transition-all duration-200 ${
                  isActive('/viajes') 
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                tooltip={isCollapsed ? "Viajes" : undefined}
              >
                <Link to="/viajes" className="flex items-center gap-3 px-3 py-2.5 min-w-0">
                  <Route className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium truncate">Viajes</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/cartas-porte')}
                className={`rounded-lg transition-all duration-200 ${
                  isActive('/cartas-porte') 
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                tooltip={isCollapsed ? "Cartas Porte" : undefined}
              >
                <Link to="/cartas-porte" className="flex items-center gap-3 px-3 py-2.5 min-w-0">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium truncate">Cartas Porte</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium text-xs uppercase tracking-wide px-3 py-2 mt-6">
            Recursos
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/vehiculos')}
                className={`rounded-lg transition-all duration-200 ${
                  isActive('/vehiculos') 
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                tooltip={isCollapsed ? "Vehículos" : undefined}
              >
                <Link to="/vehiculos" className="flex items-center gap-3 px-3 py-2.5 min-w-0">
                  <Car className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium truncate">Vehículos</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/conductores')}
                className={`rounded-lg transition-all duration-200 ${
                  isActive('/conductores') 
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                tooltip={isCollapsed ? "Conductores" : undefined}
              >
                <Link to="/conductores" className="flex items-center gap-3 px-3 py-2.5 min-w-0">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium truncate">Conductores</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/socios')}
                className={`rounded-lg transition-all duration-200 ${
                  isActive('/socios') 
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                tooltip={isCollapsed ? "Socios" : undefined}
              >
                <Link to="/socios" className="flex items-center gap-3 px-3 py-2.5 min-w-0">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium truncate">Socios</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium text-xs uppercase tracking-wide px-3 py-2 mt-6">
            Sistema
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/planes')}
                className={`rounded-lg transition-all duration-200 ${
                  isActive('/planes') 
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                tooltip={isCollapsed ? "Planes" : undefined}
              >
                <Link to="/planes" className="flex items-center gap-3 px-3 py-2.5 min-w-0">
                  <CreditCard className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium truncate">Planes</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {puedeAccederAdministracion && (
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive('/administracion')}
                  className={`rounded-lg transition-all duration-200 ${
                    isActive('/administracion') 
                      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  tooltip={isCollapsed ? "Administración" : undefined}
                >
                  <Link to="/administracion" className="flex items-center gap-3 px-3 py-2.5 min-w-0">
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium truncate">Administración</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-100 p-2">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
