
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { useTrialManager } from '@/hooks/useTrialManager';
import { toast } from 'sonner';

interface ProtectedRouteGuardProps {
  children: ReactNode;
  requiredAction?: 'create' | 'read' | 'update' | 'delete';
  resource?: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios';
  redirectTo?: string;
}

export const ProtectedRouteGuard = ({ 
  children, 
  requiredAction = 'create',
  resource = 'cartas_porte',
  redirectTo = '/dashboard' 
}: ProtectedRouteGuardProps) => {
  const { isSuperuser, hasFullAccess } = useEnhancedPermissions();
  const { getContextualMessage, canPerformAction } = useTrialManager();

  // Superusers siempre pueden acceder
  if (isSuperuser) {
    return <>{children}</>;
  }

  // BLOQUEO PRINCIPAL: Si no tiene acceso completo
  if (!hasFullAccess) {
    const message = getContextualMessage();
    toast.error(`Acceso denegado: ${message}`);
    return <Navigate to={redirectTo} replace />;
  }

  // Verificar si puede realizar la acción específica
  if (!canPerformAction(requiredAction)) {
    const message = getContextualMessage();
    toast.error(`No puede ${requiredAction === 'create' ? 'crear' : requiredAction} ${resource.replace('_', ' ')}: ${message}`);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
