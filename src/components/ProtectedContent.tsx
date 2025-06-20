
import { ReactNode } from 'react';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { useTrialManager } from '@/hooks/useTrialManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, TrendingUp, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FunctionalityType } from '@/types/permissions';

interface ProtectedContentProps {
  children: ReactNode;
  requiredFeature?: FunctionalityType;
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
  const { 
    hasFullAccess, 
    restrictionType, 
    getContextualMessage,
    isTrialExpired,
    isInGracePeriod
  } = useTrialManager();
  const navigate = useNavigate();

  console.log('🛡️ ProtectedContent Debug:', {
    requiredFeature,
    isSuperuser,
    hasFullAccess,
    restrictionType,
    estaBloqueado,
    suscripcionVencida
  });
  
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

  // BLOQUEO PRINCIPAL: Si no tiene acceso completo, mostrar mensaje de restricción
  if (!hasFullAccess) {
    console.log('❌ Content blocked - no full access:', restrictionType);

    const getAlertProps = () => {
      switch (restrictionType) {
        case 'trial_expired':
          return {
            className: 'border-orange-200 bg-orange-50',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-800',
            buttonColor: 'bg-orange-600 hover:bg-orange-700'
          };
        case 'payment_suspended':
          return {
            className: 'border-red-200 bg-red-50',
            iconColor: 'text-red-600',
            textColor: 'text-red-800',
            buttonColor: 'bg-red-600 hover:bg-red-700'
          };
        case 'grace_period':
          return {
            className: 'border-yellow-200 bg-yellow-50',
            iconColor: 'text-yellow-600',
            textColor: 'text-yellow-800',
            buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
          };
        default:
          return {
            className: 'border-gray-200 bg-gray-50',
            iconColor: 'text-gray-600',
            textColor: 'text-gray-800',
            buttonColor: 'bg-gray-600 hover:bg-gray-700'
          };
      }
    };

    const alertProps = getAlertProps();
    const message = getContextualMessage();

    if (fallback) return <>{fallback}</>;

    return (
      <Alert className={alertProps.className}>
        <Lock className={`h-4 w-4 ${alertProps.iconColor}`} />
        <AlertDescription className="flex items-center justify-between">
          <span className={alertProps.textColor}>{message}</span>
          {showUpgrade && (
            <Button 
              size="sm" 
              onClick={() => navigate('/planes')}
              className={`ml-4 ${alertProps.buttonColor}`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {restrictionType === 'payment_suspended' ? 'Renovar' : 'Ver Planes'}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Verificar funcionalidad específica solo si tiene acceso completo
  if (requiredFeature && hasFullAccess) {
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

  // Verificar plan específico solo si tiene acceso completo
  if (requiredPlan && planActual !== requiredPlan && hasFullAccess) {
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

  console.log('✅ Content access granted');
  return <>{children}</>;
};
