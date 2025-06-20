
import { ReactNode } from 'react';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { useTrialManager } from '@/hooks/useTrialManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, TrendingUp, Crown, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FunctionalityType } from '@/types/permissions';

interface ProtectedFeatureProps {
  children: ReactNode;
  requiredFeature?: FunctionalityType;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  blockOnRestriction?: boolean;
}

export const ProtectedFeature = ({ 
  children, 
  requiredFeature,
  fallback,
  showUpgrade = true,
  blockOnRestriction = true
}: ProtectedFeatureProps) => {
  const { puedeAcceder, isSuperuser } = useEnhancedPermissions();
  const { 
    hasFullAccess, 
    restrictionType, 
    getContextualMessage 
  } = useTrialManager();
  const navigate = useNavigate();
  
  // Superusers bypass all restrictions
  if (isSuperuser) {
    return <>{children}</>;
  }

  // Si está configurado para bloquear en restricciones y no tiene acceso completo
  if (blockOnRestriction && !hasFullAccess) {
    if (fallback) return <>{fallback}</>;
    
    const getAlertProps = () => {
      switch (restrictionType) {
        case 'trial_expired':
          return {
            className: 'border-orange-200 bg-orange-50',
            icon: AlertTriangle,
            iconClass: 'text-orange-600',
            textClass: 'text-orange-800',
            buttonClass: 'bg-orange-600 hover:bg-orange-700'
          };
        case 'payment_suspended':
          return {
            className: 'border-red-200 bg-red-50',
            icon: Lock,
            iconClass: 'text-red-600',
            textClass: 'text-red-800',
            buttonClass: 'bg-red-600 hover:bg-red-700'
          };
        case 'grace_period':
          return {
            className: 'border-yellow-200 bg-yellow-50',
            icon: AlertTriangle,
            iconClass: 'text-yellow-600',
            textClass: 'text-yellow-800',
            buttonClass: 'bg-yellow-600 hover:bg-yellow-700'
          };
        default:
          return {
            className: 'border-gray-200 bg-gray-50',
            icon: Lock,
            iconClass: 'text-gray-600',
            textClass: 'text-gray-800',
            buttonClass: 'bg-gray-600 hover:bg-gray-700'
          };
      }
    };

    const alertProps = getAlertProps();
    const Icon = alertProps.icon;

    return (
      <Alert className={alertProps.className}>
        <Icon className={`h-4 w-4 ${alertProps.iconClass}`} />
        <AlertDescription className="flex items-center justify-between">
          <span className={alertProps.textClass}>{getContextualMessage()}</span>
          {showUpgrade && (
            <Button 
              size="sm" 
              onClick={() => navigate('/planes')}
              className={`ml-4 ${alertProps.buttonClass}`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {restrictionType === 'trial_expired' ? 'Ver Planes' : 'Renovar'}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Verificar funcionalidad específica si se requiere
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

  return <>{children}</>;
};
