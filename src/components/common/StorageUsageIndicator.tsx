
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HardDrive, AlertTriangle, TrendingUp } from 'lucide-react';
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface StorageUsageIndicatorProps {
  className?: string;
  showUpgrade?: boolean;
}

export function StorageUsageIndicator({ className, showUpgrade = true }: StorageUsageIndicatorProps) {
  const permissions = useUnifiedPermissions();
  const navigate = useNavigate();
  
  // Superusers no tienen límites
  if (permissions.isSuperuser) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Almacenamiento ilimitado (Superuser)</span>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
              SUPERUSER
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { almacenamiento } = permissions.usage;
  const { usedGB, limit } = almacenamiento;
  
  const sinLimite = limit === null || limit === undefined;
  const porcentajeUso = sinLimite ? 0 : Math.round((usedGB / limit) * 100);
  const cercaDelLimite = porcentajeUso >= 80;
  const limiteExcedido = porcentajeUso >= 100;

  const getVariant = () => {
    if (limiteExcedido) return 'destructive';
    if (cercaDelLimite) return 'secondary';
    return 'default';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-blue-600" />
            <span>Almacenamiento</span>
          </div>
          {(cercaDelLimite || limiteExcedido) && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {usedGB.toFixed(2)} GB de {sinLimite ? '∞' : `${limit} GB`} utilizados
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
              Plan: {permissions.planActual}
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

          {limiteExcedido && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              <strong>Límite excedido:</strong> No puedes subir más archivos hasta que liberes espacio o actualices tu plan.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
