
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Infinity } from 'lucide-react';

interface LimitUsageIndicatorProps {
  resourceType: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios';
  className?: string;
  showDetails?: boolean;
}

/**
 * @deprecated - Usar LimitUsageIndicator desde common/LimitUsageIndicator.tsx que usa useUnifiedPermissionsV2
 */
export const LimitUsageIndicator = ({ 
  resourceType, 
  className, 
  showDetails = true 
}: LimitUsageIndicatorProps) => {
  const permissions = useUnifiedPermissionsV2();
  
  const resourceData = permissions.usage[resourceType];
  const isUnlimited = resourceData.limit === null;
  const percentage = isUnlimited ? 0 : (resourceData.used / resourceData.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getVariant = () => {
    if (isUnlimited) return 'default';
    if (isAtLimit) return 'destructive';
    if (isNearLimit) return 'secondary';
    return 'outline';
  };

  const getIcon = () => {
    if (isUnlimited) return <Infinity className="h-3 w-3" />;
    if (isAtLimit) return <AlertTriangle className="h-3 w-3" />;
    if (isNearLimit) return <AlertTriangle className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  const resourceNames = {
    cartas_porte: 'Cartas Porte',
    conductores: 'Conductores',
    vehiculos: 'Vehículos',
    socios: 'Socios'
  };

  if (!showDetails && isUnlimited) {
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Infinity className="h-3 w-3" />
        Ilimitado
      </Badge>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Badge variant={getVariant()} className="flex items-center gap-1">
          {getIcon()}
          {resourceData.used} {isUnlimited ? '' : `/ ${resourceData.limit}`}
          {isUnlimited && <span className="text-xs">ilimitado</span>}
        </Badge>
        {!isUnlimited && (
          <span className="text-xs text-muted-foreground">
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
      
      {!isUnlimited && showDetails && (
        <div className="space-y-1">
          <Progress 
            value={percentage} 
            className="h-2"
          />
          <div className="space-y-1">
            {isAtLimit && (
              <p className="text-xs text-red-600 font-medium">
                ¡Has alcanzado el límite de {resourceNames[resourceType]}!
              </p>
            )}
            {isNearLimit && !isAtLimit && (
              <p className="text-xs text-orange-600 font-medium">
                Te estás acercando al límite de {resourceNames[resourceType]}
              </p>
            )}
            {!isNearLimit && (
              <p className="text-xs text-green-600">
                Tienes {resourceData.limit - resourceData.used} {resourceNames[resourceType]} disponibles
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
