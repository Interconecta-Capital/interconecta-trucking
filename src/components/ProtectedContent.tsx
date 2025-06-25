
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
 * Componente de Contenido Protegido - Usa useUnifiedPermissionsV2 como única fuente de verdad
 */
export const ProtectedContent = ({ 
  children, 
  requiredFeature,
  fallback,
  showUpgrade = true 
}: ProtectedContentProps) => {
  const permissions = useUnifiedPermissionsV2();
  const navigate = useNavigate();
  
  // Superusuarios tienen acceso total
  if (permissions.accessLevel === 'superuser') {
    return <>{children}</>;
  }

  // Verificar si puede acceder al contenido
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
      return 'Tu cuenta está bloqueada por falta de pago.';
    }
    if (permissions.accessLevel === 'expired') {
      return 'Tu período de prueba ha finalizado. Actualiza tu plan para continuar.';
    }
    return 'Esta sección no está disponible en tu plan actual.';
  };

  if (canAccess()) {
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
          {showUpgrade && (
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
