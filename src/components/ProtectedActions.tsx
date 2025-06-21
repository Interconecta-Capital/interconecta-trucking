
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
  const {
    puedeCrear,
    isSuperuser,
    planActual,
    canPerformAction,
    isInGracePeriod,
    isTrialExpired
  } = useUnifiedPermissions();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleAction = () => {
    try {
      console.log('ProtectedActions: handleAction called for', resource);
      
      // Superusers can always create
      if (isSuperuser) {
        console.log('ProtectedActions: Superuser access granted');
        onAction?.();
        return;
      }

      // Verificar si puede realizar la acción
      if (!canPerformAction('create')) {
        console.log('ProtectedActions: canPerformAction returned false');
        if (isInGracePeriod) {
          toast.error('Durante el período de gracia solo puede consultar datos. Adquiera un plan para crear nuevos registros.');
        } else {
          setShowUpgradeModal(true);
        }
        return;
      }

      const result = puedeCrear(resource);
      console.log('ProtectedActions: puedeCrear result:', result);
      
      const puede = result?.puede ?? true;
      const razon = result?.razon;
      
      if (!puede && razon) {
        console.log('ProtectedActions: Access denied:', razon);
        toast.error(razon);
        return;
      }
      
      console.log('ProtectedActions: Access granted, calling onAction');
      onAction?.();
    } catch (error) {
      console.error('Error in ProtectedActions:', error);
      if (fallbackButton) {
        console.log('ProtectedActions: Fallback button activated');
        onAction?.();
      }
    }
  };

  // Renderizar botón simple si no hay children
  if (!children && action === 'create') {
    console.log('ProtectedActions: Rendering button for', resource);
    
    // Durante período de gracia, mostrar botón bloqueado
    if (isInGracePeriod) {
      console.log('ProtectedActions: Rendering grace period locked button');
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
            isTrialExpired 
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
