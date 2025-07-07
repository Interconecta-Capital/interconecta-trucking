
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useNavigate, useLocation } from "react-router-dom"

interface Project {
  name: string
  url: string
  icon: LucideIcon
}

interface NavProjectsProps {
  projects: Project[]
}

export function NavProjects({ projects }: NavProjectsProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Proyectos</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              onClick={() => navigate(item.url)}
              className={cn(
                location.pathname === item.url && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <item.icon />
              <span>{item.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
