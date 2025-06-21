
import * as React from "react"
import { Home, ChevronUp, User2, Building, Settings } from "lucide-react"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { useUnifiedPermissions } from "@/hooks/useUnifiedPermissions"
import { navItems } from "@/nav-items"
import { Link, useLocation } from "react-router-dom"
import { useSuperuser } from "@/hooks/useSuperuser"

const data = {
  navigation: [
    {
      title: "Principal",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: Home, isActive: false },
        { title: "Cartas Porte", url: "/cartas-porte", icon: "FileText", isActive: false }
      ]
    },
    {
      title: "Recursos",
      items: [
        { title: "Conductores", url: "/conductores", icon: "Users", isActive: false },
        { title: "Vehículos", url: "/vehiculos", icon: "Car", isActive: false },
        { title: "Socios", url: "/socios", icon: "Building2", isActive: false },
        { title: "Viajes", url: "/viajes", icon: "Truck", isActive: false }
      ]
    },
    {
      title: "Sistema",
      items: [
        { title: "Administración", url: "/administracion", icon: "Settings", isActive: false },
        { title: "Planes", url: "/planes", icon: "CreditCard", isActive: false },
        { title: "Mi Empresa", url: "/configuracion/empresa", icon: "Building", isActive: false }
      ]
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth()
  const { isSuperuser } = useSuperuser()
  const permissions = useUnifiedPermissions()
  const location = useLocation()

  console.log('[AppSidebar] Estado de permisos:', {
    isSuperuser: permissions.isSuperuser,
    accessLevel: permissions.accessLevel,
    canAccessAdmin: permissions.canAccessAdmin.allowed
  });

  const shouldShowAdministracion = permissions.canAccessAdmin.allowed || permissions.isSuperuser;

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Trucking Manager</span>
                  <span className="truncate text-xs">Sistema de Gestión</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  // Filtrar administración según permisos
                  if (item.title === "Administración" && !shouldShowAdministracion) {
                    return null;
                  }

                  const IconComponent = navItems.find(nav => nav.title === item.title)?.icon;
                  const isActive = location.pathname === item.url;
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.url} className="flex items-center gap-2">
                          {IconComponent && IconComponent}
                          <span>{item.title}</span>
                          {/* Mostrar badge para superusuarios */}
                          {permissions.isSuperuser && item.title === "Administración" && (
                            <Badge variant="outline" className="ml-auto text-xs border-yellow-400 text-yellow-600">
                              Super
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
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <User2 className="size-4" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.usuario?.nombre || user?.email || 'Usuario'}
                    </span>
                    <span className="truncate text-xs">
                      {permissions.planInfo.name}
                      {permissions.isSuperuser && ' (Superusuario)'}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link to="/configuracion/empresa" className="cursor-pointer">
                    <Building className="mr-2 h-4 w-4" />
                    Mi Empresa
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <User2 className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
