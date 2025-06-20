
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
  const { 
    canPerformAction, 
    hasFullAccess,
    restrictionType,
    getContextualMessage
  } = useTrialManager();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const handleAction = () => {
    // Superusers can always create
    if (isSuperuser) {
      if (onAction) {
        onAction();
      }
      return;
    }

    // Verificar si puede realizar la acción según el trial manager
    if (!canPerformAction('create')) {
      const message = getContextualMessage();
      toast.error(message);
      setShowUpgradeModal(true);
      return;
    }

    // Verificar límites específicos del recurso
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
    // Si no tiene acceso completo, mostrar botón bloqueado
    if (!hasFullAccess) {
      return (
        <>
          <Button 
            disabled 
            variant="outline" 
            className="flex items-center gap-2 opacity-50"
            onClick={handleAction}
          >
            <Lock className="h-4 w-4" />
            {restrictionType === 'grace_period' ? 'Solo lectura' : 'Bloqueado'}
          </Button>
          
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            title={restrictionType === 'trial_expired' ? 'Período de Prueba Finalizado' : 'Acceso Restringido'}
            description={getContextualMessage()}
            blockedAction={`Crear ${resource.replace('_', ' ')}`}
          />
        </>
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
          description="Necesitas un plan activo para crear nuevos registros."
          blockedAction={`Crear ${resource.replace('_', ' ')}`}
        />
      </>
    );
  }

  // Si hay children, renderizar como wrapper
  return <>{children}</>;
};
