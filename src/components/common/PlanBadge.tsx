
import { Badge } from '@/components/ui/badge';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { Calendar, Clock, Crown, Shield } from 'lucide-react';

interface PlanBadgeProps {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  showDetails?: boolean;
}

export function PlanBadge({ size = 'default', variant, showDetails = false }: PlanBadgeProps) {
  const permissions = useUnifiedPermissionsV2();

  if (!permissions.isAuthenticated) {
    return null;
  }

  // Superusuario
  if (permissions.accessLevel === 'superuser') {
    return (
      <Badge variant={variant || 'default'} size={size} className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Shield className="h-3 w-3 mr-1" />
        Superusuario
      </Badge>
    );
  }

  // Trial activo
  if (permissions.accessLevel === 'trial') {
    const daysRemaining = permissions.planInfo.daysRemaining || 0;
    return (
      <Badge variant={variant || 'secondary'} size={size} className="bg-orange-100 text-orange-800 border-orange-200">
        <Calendar className="h-3 w-3 mr-1" />
        {showDetails ? 
          `Prueba: ${daysRemaining} días restantes` : 
          `Trial (${daysRemaining}d)`
        }
      </Badge>
    );
  }

  // Trial expirado
  if (permissions.accessLevel === 'expired') {
    return (
      <Badge variant={variant || 'destructive'} size={size}>
        <Calendar className="h-3 w-3 mr-1" />
        Prueba Expirada
      </Badge>
    );
  }

  // Cuenta bloqueada
  if (permissions.accessLevel === 'blocked') {
    return (
      <Badge variant={variant || 'destructive'} size={size}>
        <Clock className="h-3 w-3 mr-1" />
        Bloqueado
      </Badge>
    );
  }

  // Plan activo
  if (permissions.accessLevel === 'paid') {
    return (
      <Badge variant={variant || 'default'} size={size} className="bg-green-100 text-green-800 border-green-200">
        <Crown className="h-3 w-3 mr-1" />
        {permissions.planInfo.name}
      </Badge>
    );
  }

  // Fallback
  return (
    <Badge variant={variant || 'outline'} size={size}>
      Sin Plan
    </Badge>
  );
}
