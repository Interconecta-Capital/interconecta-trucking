
import { useUnifiedAccessControl } from './useUnifiedAccessControl';

// Hook simplificado que solo usa el sistema unificado
export const useSimplifiedTrialManager = () => {
  const accessControl = useUnifiedAccessControl();

  console.log('🎯 useSimplifiedTrialManager usando estado unificado:', accessControl);

  return {
    // Estados principales
    isInActiveTrial: accessControl.isInActiveTrial,
    isTrialExpired: accessControl.isTrialExpired,
    isInGracePeriod: accessControl.restrictionType === 'grace_period',
    hasFullAccess: accessControl.hasFullAccess,
    daysRemaining: accessControl.daysRemaining,
    graceDaysRemaining: accessControl.restrictionType === 'grace_period' ? accessControl.daysRemaining : 0,
    
    // Estados derivados
    trialStatus: accessControl.isInActiveTrial ? 'active' : 
                accessControl.restrictionType === 'grace_period' ? 'grace_period' :
                accessControl.isTrialExpired ? 'expired' : 'not_applicable',
    shouldShowUpgradeModal: accessControl.isBlocked && accessControl.restrictionType !== 'none',
    dataWillBeDeleted: accessControl.restrictionType === 'grace_period' && accessControl.urgencyLevel === 'critical',
    restrictionType: accessControl.restrictionType,
    
    // Funciones de utilidad
    canPerformAction: (actionType: string) => {
      if (accessControl.isSuperuser) return true;
      
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
    
    getUrgencyLevel: () => accessControl.urgencyLevel,
    
    // Estado de carga
    loading: false
  };
};

// Exportar como useTrialManager para mantener compatibilidad
export { useSimplifiedTrialManager as useTrialManager };
