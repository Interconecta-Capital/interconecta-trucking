
import { ChevronRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useNavigate, useLocation } from "react-router-dom"

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}

interface NavMainProps {
  items: NavItem[]
}

export function NavMain({ items }: NavMainProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => !item.items && navigate(item.url)}
                  className={cn(
                    location.pathname === item.url && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.items && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={cn(
                            location.pathname === subItem.url && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(subItem.url)}
                            className="w-full justify-start"
                          >
                            {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                            <span>{subItem.title}</span>
                          </Button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
