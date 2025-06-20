
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

    // Lógica de trial activo
    const isInActiveTrial = trialInfo.isTrialActive && trialInfo.daysRemaining > 0;
    const isTrialExpired = trialInfo.isTrialExpired || trialInfo.daysRemaining <= 0;

    // Si el trial expiró pero no está en grace period, debe entrar automáticamente
    if (isTrialExpired && suscripcion?.status === 'trial') {
      return {
        isInActiveTrial: false,
        isTrialExpired: true,
        isInGracePeriod: false,
        hasFullAccess: false,
        daysRemaining: 0,
        graceDaysRemaining: 90, // Se activará el período de gracia
        trialStatus: 'expired',
        shouldShowUpgradeModal: true,
        dataWillBeDeleted: false
      };
    }

    return {
      isInActiveTrial,
      isTrialExpired,
      isInGracePeriod: false,
      hasFullAccess: isInActiveTrial,
      daysRemaining: trialInfo.daysRemaining,
      graceDaysRemaining: 0,
      trialStatus: isInActiveTrial ? 'active' : (isTrialExpired ? 'expired' : 'not_applicable'),
      shouldShowUpgradeModal: isTrialExpired && !suscripcion?.plan,
      dataWillBeDeleted: false
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

    // Durante período de gracia: solo lectura
    if (trialState.isInGracePeriod) {
      return action === 'view';
    }

    // Post-trial sin período de gracia: solo puede ver y acceder a planes/logout
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

    if (trialState.isInGracePeriod) {
      const days = trialState.graceDaysRemaining;
      if (trialState.dataWillBeDeleted) {
        return `¡URGENTE! Período de gracia: ${days} día${days !== 1 ? 's' : ''} antes de eliminar tus datos`;
      }
      return `Período de gracia: ${days} día${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''} (solo lectura)`;
    }

    if (trialState.isTrialExpired) {
      return 'Trial expirado - Actualiza tu plan para continuar';
    }

    if (suscripcion?.status === 'active') {
      return `Plan ${suscripcion.plan?.nombre} activo`;
    }

    return 'Acceso limitado';
  };

  // Función para obtener el estado de urgencia
  const getUrgencyLevel = (): 'low' | 'medium' | 'high' | 'critical' => {
    if (trialState.isInGracePeriod) {
      if (trialState.graceDaysRemaining <= 1) return 'critical';
      if (trialState.graceDaysRemaining <= 7) return 'high';
      return 'medium';
    }
    
    if (trialState.isInActiveTrial && trialState.daysRemaining <= 3) {
      return 'medium';
    }
    
    return 'low';
  };

  return {
    ...trialState,
    canPerformAction,
    getContextualMessage,
    getUrgencyLevel,
    loading: trialLoading
  };
};
