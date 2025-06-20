
import { useMemo } from 'react';
import { useTrialTracking } from './useTrialTracking';
import { useSuscripcion } from './useSuscripcion';
import { useSuperuser } from './useSuperuser';

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

export const useTrialManager = () => {
  const { trialInfo, loading: trialLoading } = useTrialTracking();
  const { suscripcion, estaBloqueado, suscripcionVencida } = useSuscripcion();
  const { isSuperuser } = useSuperuser();

  const trialState = useMemo((): TrialManagerState => {
    // Superusers siempre tienen acceso completo
    if (isSuperuser) {
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

    // Si está bloqueado, no tiene acceso
    if (estaBloqueado) {
      return {
        isInActiveTrial: false,
        isTrialExpired: true,
        isInGracePeriod: false,
        hasFullAccess: false,
        daysRemaining: 0,
        graceDaysRemaining: 0,
        trialStatus: 'expired',
        shouldShowUpgradeModal: true,
        dataWillBeDeleted: false
      };
    }

    // Si tiene suscripción activa, usar permisos del plan
    if (suscripcion?.status === 'active' && suscripcion.plan) {
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

    // Verificar si está en período de gracia
    if (suscripcion?.status === 'grace_period') {
      const gracePeriodEnd = suscripcion.grace_period_end ? new Date(suscripcion.grace_period_end) : null;
      const now = new Date();
      const graceDaysRemaining = gracePeriodEnd ? Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
      
      return {
        isInActiveTrial: false,
        isTrialExpired: true,
        isInGracePeriod: true,
        hasFullAccess: false, // Solo lectura durante período de gracia
        daysRemaining: 0,
        graceDaysRemaining,
        trialStatus: 'grace_period',
        shouldShowUpgradeModal: true,
        dataWillBeDeleted: graceDaysRemaining <= 7
      };
    }

    // Lógica de trial activo - usar las propiedades correctas
    const isInActiveTrial = trialInfo.isTrialActive || suscripcion?.status === 'trial';
    const isTrialExpired = trialInfo.isTrialExpired && suscripcion?.status !== 'active';
    const daysRemaining = trialInfo.daysRemaining;

    return {
      isInActiveTrial,
      isTrialExpired,
      isInGracePeriod: false,
      hasFullAccess: isInActiveTrial, // Durante trial tiene acceso completo
      daysRemaining,
      graceDaysRemaining: 0,
      trialStatus: isInActiveTrial ? 'active' : 'expired',
      shouldShowUpgradeModal: isTrialExpired,
      dataWillBeDeleted: false
    };
  }, [trialInfo, suscripcion, estaBloqueado, suscripcionVencida, isSuperuser]);

  const canPerformAction = (actionType: string) => {
    // Superusers pueden hacer todo
    if (isSuperuser) return true;
    
    // Durante trial activo, puede hacer todo
    if (trialState.isInActiveTrial) return true;
    
    // Con suscripción activa, depende del plan
    if (suscripcion?.status === 'active') return true;
    
    // En período de gracia, solo lectura
    if (trialState.isInGracePeriod) {
      return actionType === 'read' || actionType === 'view';
    }
    
    // Trial expirado sin gracia, no puede hacer nada
    return false;
  };

  const getContextualMessage = () => {
    if (isSuperuser) return 'Acceso completo de superusuario';
    if (trialState.dataWillBeDeleted) return `¡URGENTE! Tus datos serán eliminados en ${trialState.graceDaysRemaining} días`;
    if (trialState.isInGracePeriod) return `Período de gracia: ${trialState.graceDaysRemaining} días restantes`;
    if (trialState.isTrialExpired) return 'Tu período de prueba ha expirado';
    if (trialState.isInActiveTrial) {
      if (trialState.daysRemaining <= 3) return `¡Solo ${trialState.daysRemaining} días de prueba restantes!`;
      return `Período de prueba: ${trialState.daysRemaining} días restantes`;
    }
    return 'Estado desconocido';
  };

  const getUrgencyLevel = (): 'low' | 'medium' | 'high' | 'critical' => {
    if (trialState.dataWillBeDeleted) return 'critical';
    if (trialState.isInGracePeriod && trialState.graceDaysRemaining <= 7) return 'high';
    if (trialState.isTrialExpired) return 'high';
    if (trialState.isInActiveTrial && trialState.daysRemaining <= 3) return 'medium';
    return 'low';
  };

  return {
    ...trialState,
    loading: trialLoading,
    canPerformAction,
    getContextualMessage,
    getUrgencyLevel
  };
};
