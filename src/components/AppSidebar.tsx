
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
    <Sidebar variant="inset" collapsible="icon" className="border-r border-gray-20 bg-pure-white/95 backdrop-blur-premium">
      <SidebarHeader className="border-b border-gray-20 px-6 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="font-semibold text-gray-90">
              <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-blue-interconecta text-pure-white">
                <Truck className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">InterConecta</span>
                <span className="truncate text-xs text-gray-50">Trucking Platform</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-50 font-medium text-xs uppercase tracking-wide px-3 py-2">
            Principal
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/dashboard')}
                className={`rounded-xl transition-all duration-200 ${
                  isActive('/dashboard') 
                    ? 'bg-blue-interconecta text-pure-white shadow-sm' 
                    : 'text-gray-70 hover:bg-gray-05 hover:text-gray-90'
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
                className={`rounded-xl transition-all duration-200 ${
                  isActive('/viajes') 
                    ? 'bg-blue-interconecta text-pure-white shadow-sm' 
                    : 'text-gray-70 hover:bg-gray-05 hover:text-gray-90'
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
                className={`rounded-xl transition-all duration-200 ${
                  isActive('/cartas-porte') 
                    ? 'bg-blue-interconecta text-pure-white shadow-sm' 
                    : 'text-gray-70 hover:bg-gray-05 hover:text-gray-90'
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
          <SidebarGroupLabel className="text-gray-50 font-medium text-xs uppercase tracking-wide px-3 py-2 mt-6">
            Recursos
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/vehiculos')}
                className={`rounded-xl transition-all duration-200 ${
                  isActive('/vehiculos') 
                    ? 'bg-blue-interconecta text-pure-white shadow-sm' 
                    : 'text-gray-70 hover:bg-gray-05 hover:text-gray-90'
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
                className={`rounded-xl transition-all duration-200 ${
                  isActive('/conductores') 
                    ? 'bg-blue-interconecta text-pure-white shadow-sm' 
                    : 'text-gray-70 hover:bg-gray-05 hover:text-gray-90'
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
                className={`rounded-xl transition-all duration-200 ${
                  isActive('/socios') 
                    ? 'bg-blue-interconecta text-pure-white shadow-sm' 
                    : 'text-gray-70 hover:bg-gray-05 hover:text-gray-90'
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
          <SidebarGroupLabel className="text-gray-50 font-medium text-xs uppercase tracking-wide px-3 py-2 mt-6">
            Sistema
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/planes')}
                className={`rounded-xl transition-all duration-200 ${
                  isActive('/planes') 
                    ? 'bg-blue-interconecta text-pure-white shadow-sm' 
                    : 'text-gray-70 hover:bg-gray-05 hover:text-gray-90'
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
                  className={`rounded-xl transition-all duration-200 ${
                    isActive('/administracion') 
                      ? 'bg-blue-interconecta text-pure-white shadow-sm' 
                      : 'text-gray-70 hover:bg-gray-05 hover:text-gray-90'
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
      
      <SidebarFooter className="border-t border-gray-20 p-3">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
