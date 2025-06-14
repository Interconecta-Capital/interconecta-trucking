
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Star, Zap, Gift, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { useTrialManager } from '@/hooks/useTrialManager';

interface PlanBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function PlanBadge({ size = 'md', showIcon = true, className }: PlanBadgeProps) {
  const { planActual, isSuperuser, estaBloqueado, suscripcionVencida } = useEnhancedPermissions();
  const { 
    isInActiveTrial, 
    isTrialExpired, 
    isInGracePeriod,
    daysRemaining, 
    graceDaysRemaining,
    dataWillBeDeleted
  } = useTrialManager();
  
  const getPlanIcon = () => {
    if (isSuperuser) return Crown;
    if (dataWillBeDeleted) return Trash2;
    if (isInGracePeriod) return Clock;
    if (isInActiveTrial) return Gift;
    if (isTrialExpired) return AlertTriangle;
    if (planActual.includes('Enterprise')) return Shield;
    if (planActual.includes('Automatización') || planActual.includes('Profesional')) return Zap;
    if (planActual.includes('Gestión') || planActual.includes('Básico')) return Star;
    return null;
  };

  const getPlanVariant = () => {
    if (estaBloqueado || suscripcionVencida || (isTrialExpired && !isInGracePeriod)) return 'destructive';
    if (dataWillBeDeleted) return 'destructive';
    if (isSuperuser) return 'default';
    if (isInGracePeriod) return 'secondary';
    if (isInActiveTrial) return 'default';
    if (planActual.includes('Enterprise')) return 'default';
    if (planActual.includes('Automatización') || planActual.includes('Profesional')) return 'secondary';
    return 'outline';
  };

  const getPlanColor = () => {
    if (estaBloqueado || suscripcionVencida || (isTrialExpired && !isInGracePeriod)) return 'bg-red-50 text-red-700 border-red-200';
    if (dataWillBeDeleted) return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
    if (isSuperuser) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (isInGracePeriod) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (isInActiveTrial) return 'bg-green-50 text-green-700 border-green-200';
    if (planActual.includes('Enterprise')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (planActual.includes('Automatización') || planActual.includes('Profesional')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getSizeClass = () => {
    if (size === 'sm') return 'text-xs px-2 py-1';
    if (size === 'lg') return 'text-sm px-3 py-1';
    return 'text-xs px-2 py-1';
  };

  const Icon = getPlanIcon();
  
  const displayText = () => {
    if (estaBloqueado) return 'Cuenta Bloqueada';
    if (suscripcionVencida || (isTrialExpired && !isInGracePeriod)) return 'Trial Expirado';
    if (dataWillBeDeleted) return `¡Datos eliminados en ${graceDaysRemaining} días!`;
    if (isInGracePeriod) return `Período de gracia: ${graceDaysRemaining} días`;
    if (isInActiveTrial) return `Trial: ${daysRemaining} días`;
    return planActual;
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
