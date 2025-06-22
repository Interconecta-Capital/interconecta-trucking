
import { ReactNode } from 'react';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProtectedFeatureProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

/**
 * Componente de Funcionalidad Protegida - Migrado a useUnifiedPermissionsV2
 * 
 * @deprecated - Usar ProtectedContent con useUnifiedPermissionsV2 en su lugar para nuevos desarrollos
 */
export const ProtectedFeature = ({ 
  children, 
  feature, 
  fallback,
  showUpgrade = true 
}: ProtectedFeatureProps) => {
  const permissions = useUnifiedPermissionsV2();
  const navigate = useNavigate();
  
  // Superusuarios tienen acceso total
  if (permissions.accessLevel === 'superuser') {
    return <>{children}</>;
  }

  // Verificar si puede acceder a la funcionalidad
  const canAccess = () => {
    // Durante trial activo, acceso total
    if (permissions.accessLevel === 'trial') return true;
    
    // Con plan activo, verificar permisos específicos
    if (permissions.accessLevel === 'paid') {
      return permissions.hasFullAccess;
    }
    
    // Sin acceso en otros casos
    return false;
  };

  const getReason = () => {
    if (permissions.accessLevel === 'blocked') {
      return 'Cuenta bloqueada por falta de pago';
    }
    if (permissions.accessLevel === 'expired') {
      return 'Período de prueba finalizado. Actualiza tu plan para acceder a esta funcionalidad.';
    }
    return 'Esta funcionalidad no está disponible en tu plan actual';
  };

  if (canAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Alert>
      <Lock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{getReason()}</span>
        {showUpgrade && (
          <Button 
            size="sm" 
            onClick={() => navigate('/planes')}
            className="ml-4"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Actualizar Plan
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
