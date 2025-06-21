
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LimitUsageIndicatorProps {
  resourceType: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios';
  className?: string;
  showUpgrade?: boolean;
}

export function LimitUsageIndicator({ resourceType, className, showUpgrade = true }: LimitUsageIndicatorProps) {
  const { obtenerUsoActual, planActual, isSuperuser } = useEnhancedPermissions();
  const navigate = useNavigate();
  
  // Superusers no tienen límites
  if (isSuperuser) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sin límites (Superuser)</span>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
              SUPERUSER
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usoActual = obtenerUsoActual();
  const recurso = usoActual[resourceType];
  
  if (!recurso) return null;

  const { usado, limite } = recurso;
  const sinLimite = limite === null || limite === undefined;
  const porcentajeUso = sinLimite ? 0 : Math.round((usado / limite) * 100);
  const cercaDelLimite = porcentajeUso >= 80;
  const limiteExcedido = porcentajeUso >= 100;

  const getResourceLabel = (type: string) => {
    const labels = {
      cartas_porte: 'Cartas de Porte',
      conductores: 'Conductores',
      vehiculos: 'Vehículos', 
      socios: 'Socios'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getVariant = () => {
    if (limiteExcedido) return 'destructive';
    if (cercaDelLimite) return 'secondary';
    return 'default';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{getResourceLabel(resourceType)}</span>
          {(cercaDelLimite || limiteExcedido) && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {usado} de {sinLimite ? '∞' : limite} utilizados
            </span>
            <Badge variant={getVariant()}>
              {sinLimite ? '∞' : `${porcentajeUso}%`}
            </Badge>
          </div>
          
          {!sinLimite && (
            <Progress 
              value={porcentajeUso} 
              className="h-2"
            />
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Plan: {planActual}
            </span>
            
            {showUpgrade && (cercaDelLimite || limiteExcedido) && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/planes')}
                className="h-6 px-2 text-xs"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
