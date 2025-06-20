
import { ReactNode } from 'react';
import { usePermissionCheck } from '@/hooks/useUnifiedAccessControl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle, Crown, Clock, TrendingUp } from 'lucide-react';

interface UnifiedProtectedContentProps {
  children: ReactNode;
  requiredAction?: 'create' | 'read' | 'update' | 'delete';
  resource?: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios';
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  blockOnRestriction?: boolean;
  className?: string;
}

export const UnifiedProtectedContent = ({
  children,
  requiredAction = 'read',
  resource,
  fallback,
  showUpgradePrompt = true,
  blockOnRestriction = true,
  className = ''
}: UnifiedProtectedContentProps) => {
  const accessControl = usePermissionCheck();
  const navigate = useNavigate();

  console.log('🛡️ UnifiedProtectedContent:', {
    requiredAction,
    resource,
    hasFullAccess: accessControl.hasFullAccess,
    canPerformAction: accessControl.canPerformAction(requiredAction),
    restrictionType: accessControl.restrictionType,
    isSuperuser: accessControl.isSuperuser
  });

  // Superusers pasan todas las verificaciones
  if (accessControl.isSuperuser) {
    return <>{children}</>;
  }

  // Verificar si puede realizar la acción requerida
  const canPerform = accessControl.canPerformAction(requiredAction);
  
  // Si puede realizar la acción, mostrar contenido
  if (canPerform && !accessControl.isBlocked) {
    return <>{children}</>;
  }

  // Si se proporciona un fallback y no debe bloquear, usar fallback
  if (fallback && !blockOnRestriction) {
    return <>{fallback}</>;
  }

  // Determinar el tipo de alerta y mensaje basado en el estado
  const getAlertConfig = () => {
    switch (accessControl.restrictionType) {
      case 'trial_expired':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200',
          title: 'Período de prueba finalizado',
          message: accessControl.statusMessage,
          buttonText: 'Ver Planes',
          buttonColor: 'bg-orange-600 hover:bg-orange-700'
        };
      
      case 'payment_suspended':
        return {
          variant: 'destructive' as const,
          icon: Lock,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          title: 'Cuenta suspendida',
          message: accessControl.statusMessage,
          buttonText: 'Renovar Suscripción',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      
      case 'grace_period':
        return {
          variant: 'destructive' as const,
          icon: Clock,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
          title: 'Período de gracia',
          message: accessControl.statusMessage,
          buttonText: accessControl.urgencyLevel === 'critical' ? 'ADQUIRIR PLAN YA' : 'Ver Planes',
          buttonColor: accessControl.urgencyLevel === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
        };
      
      default:
        return {
          variant: 'default' as const,
          icon: Lock,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          title: 'Acceso restringido',
          message: accessControl.statusMessage || 'No tiene permisos para acceder a este contenido',
          buttonText: 'Ver Planes',
          buttonColor: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const alertConfig = getAlertConfig();
  const Icon = alertConfig.icon;

  return (
    <div className={className}>
      <Alert className={`${alertConfig.bgColor} border`} variant={alertConfig.variant}>
        <Icon className={`h-4 w-4 ${alertConfig.iconColor}`} />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{alertConfig.title}</div>
              <div className="text-sm mt-1">{alertConfig.message}</div>
              {accessControl.actionRequired && (
                <div className="text-sm font-medium mt-2">{accessControl.actionRequired}</div>
              )}
            </div>
            
            {showUpgradePrompt && (
              <Button
                size="sm"
                onClick={() => navigate('/planes')}
                className={`ml-4 ${alertConfig.buttonColor} text-white`}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {alertConfig.buttonText}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Componente específico para acciones
export const ProtectedAction = ({ 
  children, 
  action = 'create',
  resource,
  className 
}: {
  children: ReactNode;
  action?: 'create' | 'read' | 'update' | 'delete';
  resource?: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios';
  className?: string;
}) => {
  return (
    <UnifiedProtectedContent
      requiredAction={action}
      resource={resource}
      blockOnRestriction={true}
      showUpgradePrompt={true}
      className={className}
    >
      {children}
    </UnifiedProtectedContent>
  );
};

// Componente específico para contenido
export const ProtectedView = ({ 
  children, 
  fallback,
  className 
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}) => {
  return (
    <UnifiedProtectedContent
      requiredAction="read"
      blockOnRestriction={false}
      showUpgradePrompt={false}
      fallback={fallback}
      className={className}
    >
      {children}
    </UnifiedProtectedContent>
  );
};
