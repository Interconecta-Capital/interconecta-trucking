
import { ReactNode, useState } from 'react';
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';
import { Button } from '@/components/ui/button';
import { Plus, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { UpgradeModal } from '@/components/common/UpgradeModal';

interface ProtectedActionsProps {
  children?: ReactNode;
  action: 'create';
  resource: 'conductores' | 'vehiculos' | 'socios' | 'cartas_porte';
  onAction?: () => void;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'ghost';
  fallbackButton?: boolean;
}

export const ProtectedActions = ({ 
  children, 
  action, 
  resource, 
  onAction,
  buttonText = 'Crear',
  variant = 'default',
  fallbackButton = true
}: ProtectedActionsProps) => {
  const permissions = useUnifiedPermissions();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const handleAction = () => {
    try {
      // Superusers pueden hacer todo sin restricciones
      if (permissions.isSuperuser) {
        onAction?.();
        return;
      }

      // Verificar si puede realizar la acción básica
      if (!permissions.canPerformAction('create')) {
        if (permissions.isInGracePeriod) {
          toast.error('Durante el período de gracia solo puede consultar datos. Adquiera un plan para crear nuevos registros.');
        } else {
          setShowUpgradeModal(true);
        }
        return;
      }

      // Verificar límites específicos del recurso
      const result = permissions.puedeCrear(resource);
      
      if (!result.puede && result.razon) {
        toast.error(result.razon);
        return;
      }
      
      // Ejecutar la acción
      onAction?.();
    } catch (error) {
      console.error('Error in ProtectedActions:', error);
      // En caso de error, usar fallback si está habilitado
      if (fallbackButton) {
        onAction?.();
      }
    }
  };

  // Renderizar botón simple si no hay children
  if (!children && action === 'create') {
    // Durante período de gracia, mostrar botón bloqueado
    if (permissions.isInGracePeriod) {
      return (
        <Button 
          disabled 
          variant="outline" 
          className="flex items-center gap-2 opacity-50"
          onClick={handleAction}
        >
          <Lock className="h-4 w-4" />
          Solo lectura
        </Button>
      );
    }

    return (
      <>
        <Button onClick={handleAction} variant={variant} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
        
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          title="Actualiza tu Plan"
          description={
            permissions.isTrialExpired 
              ? "Tu período de prueba ha expirado. Selecciona un plan para continuar creando registros."
              : "Necesitas un plan activo para crear nuevos registros."
          }
          blockedAction={`Crear ${resource.replace('_', ' ')}`}
        />
      </>
    );
  }

  // Si hay children, renderizar como wrapper
  return <>{children}</>;
};
