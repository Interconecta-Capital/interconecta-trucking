
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
    getContextualMessage,
    isTrialExpired,
    isInGracePeriod
  } = useTrialManager();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const handleAction = () => {
    // Superusers pueden crear siempre
    if (isSuperuser) {
      if (onAction) {
        onAction();
      }
      return;
    }

    // Si no tiene acceso completo, bloquear completamente
    if (!hasFullAccess) {
      const message = getContextualMessage();
      toast.error(message);
      setShowUpgradeModal(true);
      return;
    }

    // Verificar si puede realizar la acción según el trial manager
    if (!canPerformAction('create')) {
      const message = getContextualMessage();
      toast.error(message);
      setShowUpgradeModal(true);
      return;
    }

    // Verificar límites específicos del recurso solo si tiene acceso completo
    const result = puedeCrear(resource);
    const puede = result?.puede ?? false;
    const razon = result?.razon;
    
    if (!puede && razon) {
      toast.error(razon);
      setShowUpgradeModal(true);
      return;
    }
    
    if (onAction) {
      onAction();
    }
  };

  // Si no hay children, renderizar como botón
  if (!children && action === 'create') {
    // Si no tiene acceso completo, mostrar botón completamente bloqueado
    if (!hasFullAccess) {
      const getButtonText = () => {
        if (isTrialExpired && !isInGracePeriod) {
          return 'Período de Prueba Finalizado';
        }
        if (restrictionType === 'payment_suspended') {
          return 'Cuenta Suspendida';
        }
        if (isInGracePeriod) {
          return 'Solo Lectura';
        }
        return 'Acceso Restringido';
      };

      const getModalProps = () => {
        if (isTrialExpired && !isInGracePeriod) {
          return {
            title: 'Período de Prueba Finalizado',
            description: 'Su período de prueba ha finalizado. Adquiera un plan para continuar creando registros.'
          };
        }
        if (restrictionType === 'payment_suspended') {
          return {
            title: 'Cuenta Suspendida',
            description: 'Su cuenta está suspendida por falta de pago. Renueve su suscripción para continuar.'
          };
        }
        if (isInGracePeriod) {
          return {
            title: 'Período de Gracia',
            description: 'Su cuenta está en período de gracia. Solo puede consultar datos existentes.'
          };
        }
        return {
          title: 'Acceso Restringido',
          description: 'No tiene acceso para realizar esta acción.'
        };
      };

      const modalProps = getModalProps();

      return (
        <>
          <Button 
            disabled 
            variant="outline" 
            className="flex items-center gap-2 opacity-50 cursor-not-allowed"
            onClick={handleAction}
          >
            <Lock className="h-4 w-4" />
            {getButtonText()}
          </Button>
          
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            title={modalProps.title}
            description={modalProps.description}
            blockedAction={`Crear ${resource.replace('_', ' ')}`}
          />
        </>
      );
    }

    // Si tiene acceso completo, mostrar botón normal
    return (
      <>
        <Button onClick={handleAction} variant={variant} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
        
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          title="Límite Alcanzado"
          description="Ha alcanzado el límite de su plan actual."
          blockedAction={`Crear ${resource.replace('_', ' ')}`}
        />
      </>
    );
  }

  // Si hay children, renderizar como wrapper
  return <>{children}</>;
};
