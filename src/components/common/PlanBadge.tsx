
import { Badge } from '@/components/ui/badge';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { Calendar, Clock, Crown, Shield } from 'lucide-react';

interface PlanBadgeProps {
  size?: 'sm' | 'default' | 'lg'; // Keep for compatibility but won't use
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  showDetails?: boolean;
}

export function PlanBadge({ variant, showDetails = false }: PlanBadgeProps) {
  const permissions = useUnifiedPermissionsV2();

  if (!permissions.isAuthenticated) {
    return null;
  }

  // Superusuario
  if (permissions.accessLevel === 'superuser') {
    return (
      <Badge variant={variant || 'default'} className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Shield className="h-3 w-3 mr-1" />
        Superusuario
      </Badge>
    );
  }

  // Trial activo
  if (permissions.accessLevel === 'trial') {
    const daysRemaining = permissions.planInfo.daysRemaining || 0;
    return (
      <Badge variant={variant || 'secondary'} className="bg-orange-100 text-orange-800 border-orange-200">
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
      <Badge variant={variant || 'destructive'}>
        <Calendar className="h-3 w-3 mr-1" />
        Prueba Expirada
      </Badge>
    );
  }

  // Cuenta bloqueada
  if (permissions.accessLevel === 'blocked') {
    return (
      <Badge variant={variant || 'destructive'}>
        <Clock className="h-3 w-3 mr-1" />
        Bloqueado
      </Badge>
    );
  }

  // Plan Gratis (anteriormente Freemium)
  if (permissions.accessLevel === 'freemium') {
    return (
      <Badge variant={variant || 'outline'} className="bg-gray-100 text-gray-700 border-gray-200">
        <Calendar className="h-3 w-3 mr-1" />
        Plan Gratis
      </Badge>
    );
  }

  // Plan activo/pagado
  if (permissions.accessLevel === 'paid') {
    return (
      <Badge variant={variant || 'default'} className="bg-green-100 text-green-800 border-green-200">
        <Crown className="h-3 w-3 mr-1" />
        {permissions.planInfo.name}
      </Badge>
    );
  }

  // Fallback
  return (
    <Badge variant={variant || 'outline'}>
      Sin Plan
    </Badge>
  );
}
