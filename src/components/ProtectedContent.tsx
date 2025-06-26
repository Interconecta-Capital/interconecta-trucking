
import { ReactNode } from 'react';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProtectedContentProps {
  children: ReactNode;
  requiredFeature?: string;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

/**
 * Componente de Contenido Protegido - Acceso completo para todos los usuarios autenticados
 * Solo bloquea usuarios no autenticados o con cuentas bloqueadas
 */
export const ProtectedContent = ({ 
  children, 
  requiredFeature,
  fallback,
  showUpgrade = true 
}: ProtectedContentProps) => {
  const permissions = useUnifiedPermissionsV2();
  const navigate = useNavigate();
  
  // Solo bloquear si no está autenticado o si está bloqueado
  const canAccess = permissions.isAuthenticated && permissions.accessLevel !== 'blocked';

  const getReason = () => {
    if (!permissions.isAuthenticated) {
      return 'Debes iniciar sesión para acceder a esta sección.';
    }
    if (permissions.accessLevel === 'blocked') {
      return 'Tu cuenta está bloqueada por falta de pago.';
    }
    return 'No tienes acceso a esta sección.';
  };

  if (canAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert className="max-w-md">
        <Lock className="h-4 w-4" />
        <AlertDescription className="space-y-3">
          <p>{getReason()}</p>
          {showUpgrade && permissions.accessLevel === 'blocked' && (
            <Button 
              onClick={() => navigate('/planes')}
              className="w-full"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Ver Planes
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};
