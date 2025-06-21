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
import { useSubscription } from '@/hooks/useSubscription';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppSidebar({ open, onOpenChange }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const isMobile = useIsMobile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isPro = subscription?.status === "active";

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const renderSidebarMenu = () => (
    <SidebarMenu>
      <SidebarMenuItem
        title="Panel"
        icon={Gauge}
        href="/panel"
        isActive={location.pathname === '/panel'}
      />
      <SidebarMenuItem
        title="Empresas"
        icon={Building2}
        href="/empresas"
        isActive={location.pathname === '/empresas'}
      />
      <SidebarMenuItem
        title="Viajes"
        icon={Truck}
        href="/viajes/nuevo"
        isActive={location.pathname.startsWith('/viajes')}
      />
      <SidebarMenuItem
        title="Carta Porte"
        icon={FileText}
        href="/carta-porte/lista"
        isActive={location.pathname.startsWith('/carta-porte')}
      />
      <SidebarMenuItem
        title="Usuarios"
        icon={Users}
        href="/usuarios"
        isActive={location.pathname === '/usuarios'}
      />
      {isPro && (
        <SidebarMenuItem
          title="Reportes"
          icon={BarChart3}
          href="/reportes"
          isActive={location.pathname === '/reportes'}
        />
      )}
      <SidebarMenuItem
        title="Planes"
        icon={CreditCard}
        href="/planes"
        isActive={location.pathname === '/planes'}
      />
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
    <Sidebar open={open} onOpenChange={onOpenChange}>
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
