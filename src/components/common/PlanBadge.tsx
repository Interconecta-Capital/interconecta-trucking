
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Star, Zap, Gift, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';

interface PlanBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function PlanBadge({ size = 'md', showIcon = true, className }: PlanBadgeProps) {
  const permissions = useUnifiedPermissions();
  
  const getPlanIcon = () => {
    if (permissions.isSuperuser) return Crown;
    if (permissions.isInGracePeriod) return Clock;
    if (permissions.accessLevel === 'trial') return Gift;
    if (permissions.isTrialExpired) return AlertTriangle;
    if (permissions.planActual.includes('Enterprise')) return Shield;
    if (permissions.planActual.includes('Automatización') || permissions.planActual.includes('Profesional')) return Zap;
    if (permissions.planActual.includes('Gestión') || permissions.planActual.includes('Básico')) return Star;
    return null;
  };

  const getPlanVariant = () => {
    if (permissions.estaBloqueado || permissions.suscripcionVencida || (permissions.isTrialExpired && !permissions.isInGracePeriod)) return 'destructive';
    if (permissions.isSuperuser) return 'default';
    if (permissions.isInGracePeriod) return 'secondary';
    if (permissions.accessLevel === 'trial') return 'default';
    if (permissions.planActual.includes('Enterprise')) return 'default';
    if (permissions.planActual.includes('Automatización') || permissions.planActual.includes('Profesional')) return 'secondary';
    return 'outline';
  };

  const getPlanColor = () => {
    if (permissions.estaBloqueado || permissions.suscripcionVencida || (permissions.isTrialExpired && !permissions.isInGracePeriod)) return 'bg-red-50 text-red-700 border-red-200';
    if (permissions.isSuperuser) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (permissions.isInGracePeriod) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (permissions.accessLevel === 'trial') return 'bg-green-50 text-green-700 border-green-200';
    if (permissions.planActual.includes('Enterprise')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (permissions.planActual.includes('Automatización') || permissions.planActual.includes('Profesional')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getSizeClass = () => {
    if (size === 'sm') return 'text-xs px-2 py-1';
    if (size === 'lg') return 'text-sm px-3 py-1';
    return 'text-xs px-2 py-1';
  };

  const Icon = getPlanIcon();
  
  const displayText = () => {
    if (permissions.estaBloqueado) return 'Cuenta Bloqueada';
    if (permissions.suscripcionVencida || (permissions.isTrialExpired && !permissions.isInGracePeriod)) return 'Trial Expirado';
    if (permissions.isInGracePeriod) return 'Período de gracia';
    if (permissions.accessLevel === 'trial') return 'Trial activo';
    return permissions.planActual;
  };

  return (
    <Badge 
      variant={getPlanVariant()}
      className={`${getSizeClass()} ${getPlanColor()} ${className}`}
    >
      {showIcon && Icon && <Icon className="h-3 w-3 mr-1" />}
      {displayText()}
    </Badge>
  );
}
