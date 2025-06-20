
import { ReactNode } from 'react';
import { useSimpleAccessControl } from '@/hooks/useSimpleAccessControl';

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

  console.log('🛡️ UnifiedProtectedContent:', {
    requiredAction,
    resource,
    hasFullAccess: accessControl.hasFullAccess,
    canCreateContent: accessControl.canCreateContent,
    canViewContent: accessControl.canViewContent,
    isBlocked: accessControl.isBlocked,
    isInActiveTrial: accessControl.isInActiveTrial,
    daysRemaining: accessControl.daysRemaining
  });

  // SI TIENE ACCESO COMPLETO, PERMITIR TODO
  if (accessControl.hasFullAccess) {
    console.log('✅ ACCESO PERMITIDO - Tiene acceso completo');
    return <>{children}</>;
  }

  // Si puede ver pero no crear/modificar
  if (accessControl.canViewContent && requiredAction !== 'read' && !accessControl.canCreateContent) {
    console.log('👁️ Solo puede ver contenido');
    if (fallback && !blockOnRestriction) {
      return <>{fallback}</>;
    }
  }

  // Si está completamente bloqueado
  if (accessControl.isBlocked) {
    console.log('🚫 Acceso bloqueado');
    
    if (fallback && !blockOnRestriction) {
      return <>{fallback}</>;
    }

    // NO mostrar ningún mensaje de bloqueo si está en trial activo
    if (accessControl.isInActiveTrial) {
      console.log('⚠️ ERROR: Mostrando bloqueo pero trial está activo!');
      return <>{children}</>;
    }

    return (
      <div className={className}>
        <div className="text-center p-4 text-gray-600">
          <div className="font-medium">Acceso Restringido</div>
          <div className="text-sm mt-1">{accessControl.statusMessage}</div>
        </div>
      </div>
    );
  }

  // Por defecto: permitir acceso
  return <>{children}</>;
};

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
      blockOnRestriction={false}
      showUpgradePrompt={false}
      className={className}
    >
      {children}
    </UnifiedProtectedContent>
  );
};

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
