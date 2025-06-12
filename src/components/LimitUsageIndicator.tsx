
import { usePermisosSubscripcion } from '@/hooks/usePermisosSubscripcion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface LimitUsageIndicatorProps {
  resource: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios';
  className?: string;
}

export const LimitUsageIndicator = ({ resource, className }: LimitUsageIndicatorProps) => {
  const { obtenerUsoActual } = usePermisosSubscripcion();
  const uso = obtenerUsoActual();
  
  const resourceData = uso[resource];
  if (!resourceData.limite) return null; // Sin límites

  const percentage = (resourceData.usado / resourceData.limite) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getVariant = () => {
    if (isAtLimit) return 'destructive';
    if (isNearLimit) return 'secondary';
    return 'outline';
  };

  const getIcon = () => {
    if (isAtLimit) return <AlertTriangle className="h-3 w-3" />;
    if (isNearLimit) return <AlertTriangle className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Badge variant={getVariant()} className="flex items-center gap-1">
          {getIcon()}
          {resourceData.usado} / {resourceData.limite}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {percentage.toFixed(0)}%
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2"
      />
      {isAtLimit && (
        <p className="text-xs text-red-600">
          Has alcanzado el límite de {resource.replace('_', ' ')} para tu plan actual
        </p>
      )}
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-orange-600">
          Te estás acercando al límite de {resource.replace('_', ' ')}
        </p>
      )}
    </div>
  );
};
