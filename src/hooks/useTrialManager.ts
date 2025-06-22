
import { useMemo } from 'react';
import { useUnifiedPermissionsV2 } from './useUnifiedPermissionsV2';

export interface TrialManagerState {
  isInActiveTrial: boolean;
  isTrialExpired: boolean;
  isInGracePeriod: boolean;
  hasFullAccess: boolean;
  daysRemaining: number;
  graceDaysRemaining: number;
  trialStatus: 'active' | 'expired' | 'grace_period' | 'not_applicable';
  shouldShowUpgradeModal: boolean;
  dataWillBeDeleted: boolean;
}

/**
 * Hook wrapper para compatibilidad - Usa useUnifiedPermissionsV2 internamente
 * @deprecated Usar useUnifiedPermissionsV2 directamente para nuevos desarrollos
 */
export const useTrialManager = () => {
  const permissions = useUnifiedPermissionsV2();

  const trialState = useMemo((): TrialManagerState => {
    // Superusers siempre tienen acceso completo
    if (permissions.accessLevel === 'superuser') {
      return {
        isInActiveTrial: false,
        isTrialExpired: false,
        isInGracePeriod: false,
        hasFullAccess: true,
        daysRemaining: 0,
        graceDaysRemaining: 0,
        trialStatus: 'not_applicable',
        shouldShowUpgradeModal: false,
        dataWillBeDeleted: false
      };
    }

    // Mapear estados del sistema unificado
    const isInActiveTrial = permissions.accessLevel === 'trial';
    const isTrialExpired = permissions.accessLevel === 'expired';
    const isInGracePeriod = false; // Simplificado por ahora
    const hasFullAccess = permissions.hasFullAccess;
    const daysRemaining = permissions.planInfo.daysRemaining || 0;
    
    return {
      isInActiveTrial,
      isTrialExpired,
      isInGracePeriod,
      hasFullAccess,
      daysRemaining,
      graceDaysRemaining: 0,
      trialStatus: isInActiveTrial ? 'active' : (isTrialExpired ? 'expired' : 'not_applicable'),
      shouldShowUpgradeModal: isTrialExpired,
      dataWillBeDeleted: false
    };
  }, [permissions]);

  // Verificar si puede realizar una acción específica
  const canPerformAction = (action: 'create' | 'edit' | 'delete' | 'view' = 'view'): boolean => {
    return permissions.canPerformAction(action);
  };

  // Obtener mensaje contextual según el estado
  const getContextualMessage = (): string => {
    return permissions.accessReason;
  };

  // Función para obtener el estado de urgencia
  const getUrgencyLevel = (): 'low' | 'medium' | 'high' | 'critical' => {
    if (permissions.accessLevel === 'blocked') return 'critical';
    if (permissions.accessLevel === 'expired') return 'high';
    if (permissions.accessLevel === 'trial' && (permissions.planInfo.daysRemaining || 0) <= 3) return 'medium';
    return 'low';
  };

  return {
    ...trialState,
    canPerformAction,
    getContextualMessage,
    getUrgencyLevel,
    loading: false // El sistema unificado no tiene loading separado
  };
};
