
import { useSimpleAccessControl } from './useSimpleAccessControl';

// Hook simplificado que usa la lógica simple y clara
export const useSimplifiedTrialManager = () => {
  const accessControl = useSimpleAccessControl();

  console.log('🎯 useSimplifiedTrialManager usando lógica simple:', accessControl);

  return {
    // Estados principales
    isInActiveTrial: accessControl.isInActiveTrial,
    isTrialExpired: accessControl.isTrialExpired,
    hasFullAccess: accessControl.hasFullAccess,
    daysRemaining: accessControl.daysRemaining,
    
    // Estados derivados simples
    trialStatus: accessControl.isInActiveTrial ? 'active' : 'expired',
    shouldShowUpgradeModal: accessControl.isBlocked,
    
    // Funciones de utilidad
    canPerformAction: (actionType: string) => {
      switch (actionType) {
        case 'read':
        case 'view':
          return accessControl.canViewContent;
        case 'create':
        case 'update':
        case 'delete':
          return accessControl.canCreateContent;
        default:
          return accessControl.canViewContent;
      }
    },
    
    getContextualMessage: () => accessControl.statusMessage,
    
    // Estado de carga
    loading: false
  };
};

// Exportar como useTrialManager para mantener compatibilidad
export { useSimplifiedTrialManager as useTrialManager };
