
import { ReactNode, useState } from 'react';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { useTrialManager } from '@/hooks/useTrialManager';
import { Button } from '@/components/ui/button';
import { Plus, Lock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { UpgradeModal } from '@/components/common/UpgradeModal';

interface ProtectedActionsProps {
  children?: ReactNode;
  action: 'create';
  resource: 'conductores' | 'vehiculos' | 'socios' | 'cartas_porte';
  onAction?: () => void;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export const ProtectedActions = ({ 
  children, 
  action, 
  resource, 
  onAction,
  buttonText = 'Crear',
  variant = 'default'
}: ProtectedActionsProps) => {
  const { puedeCrear, isSuperuser } = useEnhancedPermissions();
  const { canPerformAction, isInGracePeriod, isTrialExpired } = useTrialManager();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const handleAction = () => {
    // Superusers can always create
    if (isSuperuser) {
      if (onAction) {
        onAction();
      }
      return;
    }

    // Verificar si puede realizar la acción
    if (!canPerformAction('create')) {
      if (isInGracePeriod) {
        toast.error('Durante el período de gracia solo puede consultar datos. Adquiera un plan para crear nuevos registros.');
      } else {
        setShowUpgradeModal(true);
      }
      return;
    }

    const result = puedeCrear(resource);
    const puede = result?.puede ?? false;
    const razon = result?.razon;
    
    if (!puede && razon) {
      toast.error(razon);
      return;
    }
    
    if (onAction) {
      onAction();
    }
  };

  // Si no hay children, renderizar como botón
  if (!children && action === 'create') {
    // Durante período de gracia, mostrar botón bloqueado
    if (isInGracePeriod) {
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
