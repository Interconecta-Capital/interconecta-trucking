
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Truck, 
  UserCheck,
  LogOut,
  CreditCard
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from 'sonner';

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Cartas Porte",
    url: "/cartas-porte",
    icon: FileText,
  },
  {
    title: "Conductores",
    url: "/conductores",
    icon: UserCheck,
  },
  {
    title: "Vehículos",
    url: "/vehiculos",
    icon: Truck,
  },
  {
    title: "Socios",
    url: "/socios",
    icon: Users,
  },
  {
    title: "Planes",
    url: "/planes",
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
    } catch (error: any) {
      toast.error('Error al cerrar sesión: ' + error.message);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
            alt="Interconecta Capital Logo"
            className="h-10 w-10 rounded-lg flex-shrink-0"
          />
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-lg font-bold text-sidebar-foreground font-sora">Interconecta</h2>
            <p className="text-sm text-sidebar-foreground font-inter">Capital</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="w-full h-14 text-base hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    size="lg"
                  >
                    <Link to={item.url} className="flex items-center space-x-3">
                      <item.icon className="h-6 w-6 flex-shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-red-400 hover:text-red-300 h-12" 
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
