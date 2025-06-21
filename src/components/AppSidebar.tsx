
import { useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  FileText, 
  Truck, 
  Users, 
  Settings, 
  HelpCircle,
  Gauge,
  Shield,
  ChevronRight,
  Calendar,
  BarChart3,
  User,
  LogOut,
  CreditCard
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppSidebar({ open, onOpenChange }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { suscripcion } = useSuscripcion();
  const isMobile = useIsMobile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isPro = suscripcion?.status === "active";

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const renderSidebarMenu = () => (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={location.pathname === '/panel'}>
          <Link to="/panel" className="flex items-center gap-3">
            <Gauge className="h-4 w-4" />
            <span>Panel</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={location.pathname === '/empresas'}>
          <Link to="/empresas" className="flex items-center gap-3">
            <Building2 className="h-4 w-4" />
            <span>Empresas</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={location.pathname.startsWith('/viajes')}>
          <Link to="/viajes/nuevo" className="flex items-center gap-3">
            <Truck className="h-4 w-4" />
            <span>Viajes</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={location.pathname.startsWith('/carta-porte')}>
          <Link to="/carta-porte/lista" className="flex items-center gap-3">
            <FileText className="h-4 w-4" />
            <span>Carta Porte</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={location.pathname === '/usuarios'}>
          <Link to="/usuarios" className="flex items-center gap-3">
            <Users className="h-4 w-4" />
            <span>Usuarios</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {isPro && (
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={location.pathname === '/reportes'}>
            <Link to="/reportes" className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4" />
              <span>Reportes</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={location.pathname === '/planes'}>
          <Link to="/planes" className="flex items-center gap-3">
            <CreditCard className="h-4 w-4" />
            <span>Planes</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );

  const renderSidebarFooter = () => (
    <SidebarFooter>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2 w-full justify-start" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </SidebarFooter>
  );

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-interconecta.svg" alt="Interconecta Logo" className="h-8" />
            <span className="font-bold text-xl">Interconecta</span>
          </Link>
        </SidebarHeader>
        {renderSidebarMenu()}
        {renderSidebarFooter()}
      </SidebarContent>
    </Sidebar>
  );
}
