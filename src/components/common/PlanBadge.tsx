
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Star, Zap } from 'lucide-react';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';

interface PlanBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function PlanBadge({ size = 'md', showIcon = true, className }: PlanBadgeProps) {
  const { planActual, isSuperuser, estaBloqueado, suscripcionVencida } = useEnhancedPermissions();
  
  const getPlanIcon = () => {
    if (isSuperuser) return Crown;
    if (planActual.includes('Enterprise')) return Shield;
    if (planActual.includes('Automatización')) return Zap;
    if (planActual.includes('Gestión')) return Star;
    return null;
  };

  const getPlanVariant = () => {
    if (estaBloqueado || suscripcionVencida) return 'destructive';
    if (isSuperuser) return 'default';
    if (planActual.includes('Enterprise')) return 'default';
    if (planActual.includes('Automatización')) return 'secondary';
    return 'outline';
  };

  const getPlanColor = () => {
    if (estaBloqueado || suscripcionVencida) return 'bg-red-50 text-red-700 border-red-200';
    if (isSuperuser) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (planActual.includes('Enterprise')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (planActual.includes('Automatización')) return 'bg-blue-50 text-blue-700 border-blue-200';
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
    if (suscripcionVencida) return 'Suscripción Vencida';
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
