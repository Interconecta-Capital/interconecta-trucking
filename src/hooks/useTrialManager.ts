
import { useMemo } from 'react';
import { useTrialTracking } from './useTrialTracking';
import { useSuscripcion } from './useSuscripcion';
import { useSuperuser } from './useSuperuser';

export interface TrialManagerState {
  isInActiveTrial: boolean;
  isTrialExpired: boolean;
  hasFullAccess: boolean;
  daysRemaining: number;
  trialStatus: 'active' | 'expired' | 'not_applicable';
  shouldShowUpgradeModal: boolean;
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
        hasFullAccess: true,
        daysRemaining: 0,
        trialStatus: 'not_applicable',
        shouldShowUpgradeModal: false
      };
    }

    // Si está bloqueado o suscripción vencida, no tiene acceso
    if (estaBloqueado || suscripcionVencida()) {
      return {
        isInActiveTrial: false,
        isTrialExpired: true,
        hasFullAccess: false,
        daysRemaining: 0,
        trialStatus: 'expired',
        shouldShowUpgradeModal: true
      };
    }

    // Si tiene suscripción activa, usar permisos del plan
    if (suscripcion?.status === 'active' && suscripcion.plan) {
      return {
        isInActiveTrial: false,
        isTrialExpired: false,
        hasFullAccess: true, // Con plan pagado tiene acceso según su plan
        daysRemaining: 0,
        trialStatus: 'not_applicable',
        shouldShowUpgradeModal: false
      };
    }

    // Lógica de trial
    const isInActiveTrial = trialInfo.isTrialActive && trialInfo.daysRemaining > 0;
    const isTrialExpired = trialInfo.isTrialExpired || trialInfo.daysRemaining <= 0;

    return {
      isInActiveTrial,
      isTrialExpired,
      hasFullAccess: isInActiveTrial, // Acceso completo durante trial activo
      daysRemaining: trialInfo.daysRemaining,
      trialStatus: isInActiveTrial ? 'active' : (isTrialExpired ? 'expired' : 'not_applicable'),
      shouldShowUpgradeModal: isTrialExpired && !suscripcion?.plan
    };
  }, [trialInfo, suscripcion, estaBloqueado, suscripcionVencida, isSuperuser]);

  // Verificar si puede realizar una acción específica
  const canPerformAction = (action: 'create' | 'edit' | 'delete' | 'view' = 'view'): boolean => {
    // Superusers pueden hacer todo
    if (isSuperuser) return true;

    // Durante trial activo, puede hacer todo
    if (trialState.isInActiveTrial) return true;

    // Con plan activo, puede hacer todo según su plan
    if (suscripcion?.status === 'active') return true;

    // Post-trial o sin plan: solo puede ver y acceder a planes/logout
    if (action === 'view') return true;

    return false;
  };

  // Obtener mensaje contextual según el estado
  const getContextualMessage = (): string => {
    if (isSuperuser) return 'Acceso completo como Superuser';
    
    if (trialState.isInActiveTrial) {
      const days = trialState.daysRemaining;
      return `Trial activo: ${days} día${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`;
    }

    if (trialState.isTrialExpired) {
      return 'Trial expirado - Actualiza tu plan para continuar';
    }

    if (suscripcion?.status === 'active') {
      return `Plan ${suscripcion.plan?.nombre} activo`;
    }

    return 'Acceso limitado';
  };

  return {
    ...trialState,
    canPerformAction,
    getContextualMessage,
    loading: trialLoading
  };
};
