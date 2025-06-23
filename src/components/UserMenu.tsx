
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, Shield, Crown, Zap, CreditCard } from 'lucide-react';
import { UserProfileDialog } from './UserProfileDialog';
import { SettingsDialog } from './SettingsDialog';
import { MobileTrialInfo } from './MobileTrialInfo';
import { Badge } from '@/components/ui/badge';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const permissions = useUnifiedPermissionsV2();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
      // signOut ya maneja la redirección en useUnifiedAuth
    } catch (error: any) {
      toast.error('Error al cerrar sesión: ' + error.message);
    }
  };

  const handleGoToPlans = () => {
    navigate('/planes');
  };

  const getPlanIcon = () => {
    switch (permissions.accessLevel) {
      case 'superuser':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'trial':
        return <Zap className="h-4 w-4 text-orange-600" />;
      case 'paid':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPlanBadge = () => {
    switch (permissions.accessLevel) {
      case 'superuser':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Crown className="h-3 w-3 mr-1" />
            Superusuario
          </Badge>
        );
      case 'trial':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Zap className="h-3 w-3 mr-1" />
            Trial ({permissions.planInfo.daysRemaining || 0}d)
          </Badge>
        );
      case 'paid':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            {permissions.planInfo.name || 'Pro'}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600">
            Sin Plan
          </Badge>
        );
    }
  };

  if (!user) return null;

  const userName = user.profile?.nombre || user.usuario?.nombre || user.email?.split('@')[0] || 'Usuario';
  const userEmail = user.email || '';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  const userRole = user.profile?.empresa || 'Transportista';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-auto px-3 rounded-full">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profile?.avatar_url} alt={userName} />
                <AvatarFallback className="bg-trucking-blue-100 text-trucking-blue-600 font-semibold text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {!isMobile && (
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profile?.avatar_url} alt={userName} />
                  <AvatarFallback className="bg-trucking-blue-100 text-trucking-blue-600 font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {userEmail}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {userRole}
                  </p>
                </div>
              </div>
              
              {/* Plan Badge */}
              <div className="flex items-center justify-between">
                {getPlanBadge()}
                {permissions.accessLevel !== 'superuser' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleGoToPlans}
                    className="text-xs h-auto py-1 px-2"
                  >
                    Ver Planes
                  </Button>
                )}
              </div>
            </div>
          </DropdownMenuLabel>

          {/* Información de Trial/Plan para móvil */}
          {isMobile && <MobileTrialInfo />}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowProfile(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Mi Perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleGoToPlans}>
            {getPlanIcon()}
            <span className="ml-2">Mi Plan</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfileDialog 
        open={showProfile} 
        onOpenChange={setShowProfile} 
      />

      <SettingsDialog />
    </>
  );
}
