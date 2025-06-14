
import { usePermisosSubscripcion } from '@/hooks/usePermisosSubscripcion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Infinity } from 'lucide-react';

interface LimitUsageIndicatorProps {
  resource: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios';
  className?: string;
  showDetails?: boolean;
}

export const LimitUsageIndicator = ({ 
  resource, 
  className, 
  showDetails = true 
}: LimitUsageIndicatorProps) => {
  const { obtenerUsoActual } = usePermisosSubscripcion();
  const uso = obtenerUsoActual();
  
  const resourceData = uso[resource];
  const isUnlimited = resourceData.limite === null;
  const percentage = isUnlimited ? 0 : (resourceData.usado / resourceData.limite) * 100;
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

  const getProgressColor = () => {
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-orange-500';
    return 'bg-green-500';
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
          {resourceData.usado} {isUnlimited ? '' : `/ ${resourceData.limite}`}
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
                ¡Has alcanzado el límite de {resourceNames[resource]}!
              </p>
            )}
            {isNearLimit && !isAtLimit && (
              <p className="text-xs text-orange-600 font-medium">
                Te estás acercando al límite de {resourceNames[resource]}
              </p>
            )}
            {!isNearLimit && (
              <p className="text-xs text-green-600">
                Tienes {resourceData.limite - resourceData.usado} {resourceNames[resource]} disponibles
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
