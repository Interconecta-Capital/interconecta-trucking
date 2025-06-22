
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Star, Zap, Gift, AlertTriangle, Clock } from 'lucide-react';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';

interface PlanBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function PlanBadge({ size = 'md', showIcon = true, className }: PlanBadgeProps) {
  const permissions = useUnifiedPermissionsV2();
  
  const getPlanIcon = () => {
    if (permissions.accessLevel === 'superuser') return Crown;
    if (permissions.accessLevel === 'trial') return Gift;
    if (permissions.accessLevel === 'blocked') return AlertTriangle;
    if (permissions.accessLevel === 'expired') return Clock;
    if (permissions.planInfo.name.includes('Enterprise')) return Shield;
    if (permissions.planInfo.name.includes('Profesional') || permissions.planInfo.name.includes('Automatización')) return Zap;
    if (permissions.planInfo.name.includes('Básico') || permissions.planInfo.name.includes('Gestión')) return Star;
    return null;
  };

  const getPlanVariant = () => {
    if (permissions.accessLevel === 'blocked' || permissions.accessLevel === 'expired') return 'destructive';
    if (permissions.accessLevel === 'superuser') return 'default';
    if (permissions.accessLevel === 'trial') return 'default';
    if (permissions.planInfo.name.includes('Enterprise')) return 'default';
    if (permissions.planInfo.name.includes('Profesional') || permissions.planInfo.name.includes('Automatización')) return 'secondary';
    return 'outline';
  };

  const getPlanColor = () => {
    if (permissions.accessLevel === 'blocked' || permissions.accessLevel === 'expired') return 'bg-red-50 text-red-700 border-red-200';
    if (permissions.accessLevel === 'superuser') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (permissions.accessLevel === 'trial') return 'bg-green-50 text-green-700 border-green-200';
    if (permissions.planInfo.name.includes('Enterprise')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (permissions.planInfo.name.includes('Profesional') || permissions.planInfo.name.includes('Automatización')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getSizeClass = () => {
    if (size === 'sm') return 'text-xs px-2 py-1';
    if (size === 'lg') return 'text-sm px-3 py-1';
    return 'text-xs px-2 py-1';
  };

  const Icon = getPlanIcon();
  
  const displayText = () => {
    if (permissions.accessLevel === 'blocked') return 'Cuenta Bloqueada';
    if (permissions.accessLevel === 'expired') return 'Plan Expirado';
    if (permissions.accessLevel === 'trial') return `Trial activo (${permissions.planInfo.daysRemaining || 0} días)`;
    return permissions.planInfo.name;
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
