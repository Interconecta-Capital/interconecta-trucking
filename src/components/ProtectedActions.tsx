
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
  const { puedeCrear, isSuperuser, hasFullAccess, restrictionType } = useEnhancedPermissions();
  const { 
    canPerformAction, 
    getContextualMessage,
    isTrialExpired,
    isInGracePeriod
  } = useTrialManager();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  console.log('🛡️ ProtectedActions Debug:', {
    resource,
    action,
    isSuperuser,
    hasFullAccess,
    restrictionType,
    canPerformAction: canPerformAction('create')
  });
  
  const handleAction = () => {
    console.log('🎯 Action attempted:', { resource, action, isSuperuser, hasFullAccess });

    // Superusers pueden crear siempre
    if (isSuperuser) {
      console.log('✅ Superuser - action allowed');
      if (onAction) {
        onAction();
      }
      return;
    }

    // BLOQUEO PRINCIPAL: Si no tiene acceso completo, bloquear completamente
    if (!hasFullAccess) {
      console.log('❌ Action blocked - no full access');
      const message = getContextualMessage();
      toast.error(message);
      setShowUpgradeModal(true);
      return;
    }

    // Verificar si puede realizar la acción según el trial manager
    if (!canPerformAction('create')) {
      console.log('❌ Action blocked - cannot perform create action');
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
      console.log('❌ Action blocked - resource limit:', razon);
      toast.error(razon);
      setShowUpgradeModal(true);
      return;
    }
    
    console.log('✅ Action allowed - executing');
    if (onAction) {
      onAction();
    }
  };

  // Si no hay children, renderizar como botón
  if (!children && action === 'create') {
    // BOTÓN COMPLETAMENTE BLOQUEADO: Si no tiene acceso completo
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

  // Si hay children, renderizar como wrapper pero BLOQUEAR si no tiene acceso
  if (!hasFullAccess && !isSuperuser) {
    console.log('❌ Children blocked - no full access');
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded">
          <div className="text-center">
            <Lock className="h-6 w-6 mx-auto text-gray-500 mb-2" />
            <p className="text-sm text-gray-600">Acceso Restringido</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
