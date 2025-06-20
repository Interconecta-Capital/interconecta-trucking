
import { ReactNode } from 'react';
import { useSimpleAccessControl } from '@/hooks/useSimpleAccessControl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

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
  const accessControl = useSimpleAccessControl();
  const navigate = useNavigate();

  console.log('🛡️ UnifiedProtectedContent con lógica simple:', {
    requiredAction,
    resource,
    hasFullAccess: accessControl.hasFullAccess,
    canCreateContent: accessControl.canCreateContent,
    canViewContent: accessControl.canViewContent,
    isBlocked: accessControl.isBlocked,
    isInActiveTrial: accessControl.isInActiveTrial,
    daysRemaining: accessControl.daysRemaining
  });

  // SI TIENE ACCESO COMPLETO (trial activo o plan pagado), PERMITIR TODO
  if (accessControl.hasFullAccess) {
    const canPerform = requiredAction === 'read' ? accessControl.canViewContent : accessControl.canCreateContent;
    if (canPerform) {
      console.log('✅ Acceso permitido: tiene acceso completo');
      return <>{children}</>;
    }
  }

  // Si solo puede ver contenido pero requiere crear/modificar, mostrar restricción
  if (accessControl.canViewContent && requiredAction !== 'read' && !accessControl.canCreateContent) {
    console.log('👁️ Solo puede ver contenido');
    if (fallback && !blockOnRestriction) {
      return <>{fallback}</>;
    }
  }

  // Si está completamente bloqueado
  if (accessControl.isBlocked) {
    console.log('🚫 Acceso bloqueado completamente');
    
    if (fallback && !blockOnRestriction) {
      return <>{fallback}</>;
    }

    return (
      <div className={className}>
        <Alert className="bg-orange-50 border-orange-200" variant="destructive">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Trial Expirado</div>
                <div className="text-sm mt-1">{accessControl.statusMessage}</div>
              </div>
              
              {showUpgradePrompt && (
                <Button
                  size="sm"
                  onClick={() => navigate('/planes')}
                  className="ml-4 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Ver Planes
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Caso por defecto: permitir acceso
  return <>{children}</>;
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
