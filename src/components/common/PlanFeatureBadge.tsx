
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Gift } from 'lucide-react';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';

interface PlanFeatureBadgeProps {
  requiredPlan: 'basico' | 'profesional' | 'empresarial';
  feature: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

const planConfig = {
  basico: {
    name: 'Plan Básico',
    icon: Star,
    color: 'bg-gray-100 text-gray-700 border-gray-300'
  },
  profesional: {
    name: 'Plan Profesional',
    icon: Zap,
    color: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  empresarial: {
    name: 'Plan Empresarial',
    icon: Crown,
    color: 'bg-purple-100 text-purple-700 border-purple-300'
  }
};

export const PlanFeatureBadge = ({ 
  requiredPlan, 
  feature, 
  size = 'sm', 
  showIcon = true,
  className = '' 
}: PlanFeatureBadgeProps) => {
  const permissions = useUnifiedPermissionsV2();
  const config = planConfig[requiredPlan];
  const Icon = config.icon;

  // Superusuarios no ven badges (tienen acceso total)
  if (permissions.accessLevel === 'superuser') {
    return null;
  }

  // Durante trial activo, mostrar que está desbloqueado
  if (permissions.accessLevel === 'trial') {
    return (
      <Badge 
        variant="outline" 
        className={`${size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} bg-green-100 text-green-700 border-green-300 ${className}`}
      >
        {showIcon && <Gift className="h-3 w-3 mr-1" />}
        Desbloqueado en Trial
      </Badge>
    );
  }

  // Post-trial o sin acceso, mostrar plan requerido
  if (permissions.accessLevel === 'expired' || !permissions.hasFullAccess) {
    return (
      <Badge 
        variant="outline" 
        className={`${size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} ${config.color} ${className}`}
      >
        {showIcon && <Icon className="h-3 w-3 mr-1" />}
        {config.name}
      </Badge>
    );
  }

  // Con plan activo, no mostrar badge (ya tiene acceso)
  return null;
};
