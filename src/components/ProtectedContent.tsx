
import { ReactNode } from 'react';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, TrendingUp, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProtectedContentProps {
  children: ReactNode;
  requiredFeature?: string;
  requiredPlan?: string;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export const ProtectedContent = ({ 
  children, 
  requiredFeature,
  requiredPlan,
  fallback,
  showUpgrade = true
}: ProtectedContentProps) => {
  const { puedeAcceder, planActual, estaBloqueado, suscripcionVencida, isSuperuser } = useEnhancedPermissions();
  const navigate = useNavigate();
  
  // Superusers bypass all restrictions
  if (isSuperuser) {
    return (
      <div className="space-y-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <Crown className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-yellow-800 flex items-center gap-2">
              <Badge variant="outline" className="border-yellow-600 text-yellow-800">
                SUPERUSER
              </Badge>
              Acceso completo sin restricciones
            </span>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  // Verificar bloqueos primero
  if (estaBloqueado) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-red-800">Su cuenta está bloqueada por falta de pago</span>
          {showUpgrade && (
            <Button 
              size="sm" 
              onClick={() => navigate('/planes')}
              className="ml-4 bg-red-600 hover:bg-red-700"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Renovar Suscripción
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (suscripcionVencida) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <Lock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-orange-800">Su suscripción ha vencido</span>
          {showUpgrade && (
            <Button 
              size="sm" 
              onClick={() => navigate('/planes')}
              className="ml-4 bg-orange-600 hover:bg-orange-700"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Renovar Plan
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Verificar funcionalidad específica
  if (requiredFeature) {
    const result = puedeAcceder(requiredFeature);
    const puede = result?.puede ?? false;
    const razon = result?.razon;
    
    if (!puede) {
      if (fallback) return <>{fallback}</>;
      
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <Lock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-800">{razon || 'Funcionalidad no disponible'}</span>
            {showUpgrade && (
              <Button 
                size="sm" 
                onClick={() => navigate('/planes')}
                className="ml-4 bg-blue-600 hover:bg-blue-700"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Actualizar Plan
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }
  }

  // Verificar plan específico
  if (requiredPlan && planActual !== requiredPlan) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Alert className="border-purple-200 bg-purple-50">
        <Lock className="h-4 w-4 text-purple-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-purple-800">
            Esta funcionalidad requiere el plan {requiredPlan}. Plan actual: {planActual}
          </span>
          {showUpgrade && (
            <Button 
              size="sm" 
              onClick={() => navigate('/planes')}
              className="ml-4 bg-purple-600 hover:bg-purple-700"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Actualizar a {requiredPlan}
            </Button>
            )}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
