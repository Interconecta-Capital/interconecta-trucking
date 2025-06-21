
import { ReactNode, useState } from 'react';
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';
import { Button } from '@/components/ui/button';
import { Plus, Lock, Crown } from 'lucide-react';
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
  
  console.log('[ProtectedActions] Estado de permisos:', {
    resource,
    isSuperuser: permissions.isSuperuser,
    accessLevel: permissions.accessLevel,
    canCreate: getCanCreate()
  });
  
  function getCanCreate() {
    switch (resource) {
      case 'conductores':
        return permissions.canCreateConductor;
      case 'vehiculos':
        return permissions.canCreateVehiculo;
      case 'socios':
        return permissions.canCreateSocio;
      case 'cartas_porte':
        return permissions.canCreateCartaPorte;
      default:
        return { allowed: false, reason: 'Recurso no reconocido' };
    }
  }
  
  const handleAction = () => {
    try {
      const canCreate = getCanCreate();
      
      console.log('[ProtectedActions] Ejecutando acción:', {
        resource,
        canCreate,
        isSuperuser: permissions.isSuperuser
      });

      // Superusers pueden hacer todo sin restricciones
      if (permissions.isSuperuser) {
        console.log('[ProtectedActions] ✅ Superusuario - permitir acción');
        onAction?.();
        return;
      }

      // Verificar si puede realizar la acción
      if (!canCreate.allowed) {
        console.log('[ProtectedActions] ❌ Acción bloqueada:', canCreate.reason);
        
        if (permissions.isInGracePeriod) {
          toast.error('Durante el período de gracia solo puede consultar datos. Adquiera un plan para crear nuevos registros.');
        } else {
          toast.error(canCreate.reason || 'No tiene permisos para esta acción');
          setShowUpgradeModal(true);
        }
        return;
      }
      
      console.log('[ProtectedActions] ✅ Acción permitida - ejecutando');
      // Ejecutar la acción
      onAction?.();
    } catch (error) {
      console.error('[ProtectedActions] Error:', error);
      // En caso de error, usar fallback si está habilitado
      if (fallbackButton) {
        onAction?.();
      }
    }
  };

  // Renderizar botón simple si no hay children
  if (!children && action === 'create') {
    const canCreate = getCanCreate();
    
    // Para superusuarios, mostrar con indicador especial
    if (permissions.isSuperuser) {
      return (
        <>
          <Button onClick={handleAction} variant={variant} className="flex items-center gap-2 border-yellow-400 bg-yellow-50 hover:bg-yellow-100 text-yellow-800">
            <Crown className="h-4 w-4" />
            {buttonText} (Superusuario)
          </Button>
        </>
      );
    }
    
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

    // Si no puede crear, mostrar botón deshabilitado
    if (!canCreate.allowed) {
      return (
        <>
          <Button 
            onClick={handleAction} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            {buttonText}
          </Button>
          
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            title="Actualiza tu Plan"
            description={canCreate.reason || "Necesitas un plan activo para crear nuevos registros."}
            blockedAction={`Crear ${resource.replace('_', ' ')}`}
          />
        </>
      );
    }

    // Botón normal si tiene permisos
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
