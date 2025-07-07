
import * as React from "react"
import {
  Calendar,
  Car,
  ChevronUp,
  FileText,
  Home,
  MapPin,
  Settings,
  TrendingUp,
  User2,
  Users,
  BarChart3,
  FileX,
  ClipboardList,
  Truck,
  FileBarChart,
  RotateCcw
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Usuario",
    email: "usuario@ejemplo.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: false,
    },
    {
      title: "Viajes",
      url: "/viajes", 
      icon: MapPin,
      isActive: false,
    },
    {
      title: "Vehículos",
      url: "/vehiculos",
      icon: Car,
      isActive: false,
    },
    {
      title: "Conductores", 
      url: "/conductores",
      icon: User2,
      isActive: false,
    },
    {
      title: "Socios",
      url: "/socios",
      icon: Users,
      isActive: false,
    },
    {
      title: "Documentos",
      url: "/cartas-porte",
      icon: FileText,
      isActive: false,
    },
    {
      title: "Borradores",
      url: "/borradores",
      icon: FileX,
      isActive: false,
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3,
      isActive: false,
      items: [
        {
          title: "Viajes Analytics",
          url: "/analytics/viajes",
          icon: TrendingUp,
        },
        {
          title: "Reportes Automáticos",
          url: "/reportes-automaticos",
          icon: RotateCcw,
        },
      ],
    },
    {
      title: "Configuración",
      url: "/configuracion",
      icon: Settings,
      isActive: false,
    },
  ],
  projects: [
    {
      name: "Calendario",
      url: "/calendario",
      icon: Calendar,
    },
    {
      name: "Mantenimiento",
      url: "/mantenimiento", 
      icon: Truck,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
