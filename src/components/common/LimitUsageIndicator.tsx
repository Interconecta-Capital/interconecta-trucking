
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { FileText, Car, Users, Building2 } from 'lucide-react';

interface LimitUsageIndicatorProps {
  resourceType: 'cartas_porte' | 'vehiculos' | 'conductores' | 'socios';
  className?: string;
}

export function LimitUsageIndicator({ resourceType, className }: LimitUsageIndicatorProps) {
  const { obtenerUsoActual, obtenerLimites, isSuperuser, planActual } = useEnhancedPermissions();
  
  const usoData = obtenerUsoActual();
  const limites = obtenerLimites();
  
  const uso = usoData[resourceType];
  const limite = limites[resourceType];
  
  const usado = typeof uso === 'object' ? uso.usado : (uso || 0);
  const limiteFinal = typeof uso === 'object' ? uso.limite : limite;
  
  const getIcon = () => {
    switch (resourceType) {
      case 'cartas_porte': return FileText;
      case 'vehiculos': return Car;
      case 'conductores': return Users;
      case 'socios': return Building2;
      default: return FileText;
    }
  };

  const getTitle = () => {
    switch (resourceType) {
      case 'cartas_porte': return 'Cartas de Porte';
      case 'vehiculos': return 'Vehículos';
      case 'conductores': return 'Conductores';
      case 'socios': return 'Socios';
      default: return resourceType;
    }
  };

  const getProgressPercentage = () => {
    if (limiteFinal === null || limiteFinal === undefined) return 0;
    return Math.min((usado / limiteFinal) * 100, 100);
  };

  const getVariant = () => {
    if (isSuperuser || limiteFinal === null) return 'default';
    const percentage = getProgressPercentage();
    if (percentage >= 90) return 'destructive';
    if (percentage >= 75) return 'secondary';
    return 'default';
  };

  const Icon = getIcon();
  const percentage = getProgressPercentage();
  // Ensure planActual is always a string
  const planName = planActual || 'Plan Básico';

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {getTitle()}
        </CardTitle>
        <Badge variant={getVariant()} className="text-xs">
          {isSuperuser || limiteFinal === null ? 'Ilimitado' : `${usado}/${limiteFinal}`}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Utilizados</span>
            <span className="font-medium">{usado}</span>
          </div>
          
          {limiteFinal !== null && !isSuperuser && (
            <>
              <Progress value={percentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Límite del plan</span>
                <span>{limiteFinal}</span>
              </div>
            </>
          )}
          
          {(isSuperuser || limiteFinal === null) && (
            <div className="text-xs text-muted-foreground text-center py-2">
              Sin límites en {planName}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
