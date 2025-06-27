
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Infinity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfMonth, endOfMonth } from 'date-fns';

interface LimitUsageIndicatorProps {
  resourceType: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios' | 'remolques' | 'viajes';
  className?: string;
  showDetails?: boolean;
}

export const LimitUsageIndicator = ({ 
  resourceType, 
  className, 
  showDetails = true 
}: LimitUsageIndicatorProps) => {
  const permissions = useUnifiedPermissionsV2();
  const { user } = useAuth();

  // Obtener conteo real de la base de datos
  const { data: realCount } = useQuery({
    queryKey: ['real-count', resourceType, user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);

      switch (resourceType) {
        case 'vehiculos': {
          const vehiculosRes = await supabase
            .from('vehiculos')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id);
          return vehiculosRes.count || 0;
        }

        case 'conductores': {
          const conductoresRes = await supabase
            .from('conductores')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id);
          return conductoresRes.count || 0;
        }

        case 'socios': {
          const sociosRes = await supabase
            .from('socios')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id);
          return sociosRes.count || 0;
        }

        case 'remolques': {
          const remolquesRes = await supabase
            .from('remolques_ccp')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id);
          return remolquesRes.count || 0;
        }

        case 'cartas_porte': {
          const cartasRes = await supabase
            .from('cartas_porte')
            .select('id', { count: 'exact' })
            .eq('usuario_id', user.id)
            .gte('created_at', startOfCurrentMonth.toISOString())
            .lte('created_at', endOfCurrentMonth.toISOString());
          return cartasRes.count || 0;
        }

        case 'viajes': {
          const viajesRes = await supabase
            .from('viajes')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .gte('created_at', startOfCurrentMonth.toISOString())
            .lte('created_at', endOfCurrentMonth.toISOString());
          return viajesRes.count || 0;
        }

        default:
          return 0;
      }
    },
    enabled: !!user?.id
  });
  
  // Obtener datos de uso del recurso desde permissions
  const resourceData = permissions.usage[resourceType];
  const actualUsed = realCount ?? 0;
  const isUnlimited = resourceData?.limit === null || permissions.accessLevel === 'superuser';
  const limit = resourceData?.limit ?? null;
  const percentage = isUnlimited ? 0 : (actualUsed / (limit || 1)) * 100;
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
    socios: 'Socios',
    remolques: 'Remolques',
    viajes: 'Viajes'
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
        <span className="text-sm font-medium">{resourceNames[resourceType]}</span>
        <Badge variant={getVariant()} className="flex items-center gap-1">
          {getIcon()}
          {actualUsed} {isUnlimited ? '' : `/ ${limit}`}
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
            {!isNearLimit && limit && (
              <p className="text-xs text-green-600">
                Tienes {limit - actualUsed} {resourceNames[resourceType]} disponibles
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
