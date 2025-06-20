
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
  restrictionType: 'none' | 'trial_expired' | 'payment_suspended' | 'grace_period';
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
        dataWillBeDeleted: false,
        restrictionType: 'none'
      };
    }

    // Verificar fechas reales del trial
    const now = new Date();
    const trialEndDate = trialInfo.trialEndDate || (suscripcion?.fecha_fin_prueba ? new Date(suscripcion.fecha_fin_prueba) : null);
    const isTrialActiveByDate = trialEndDate ? trialEndDate > now : false;
    const realDaysRemaining = trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

    // Determinar si es trial activo REAL (verificando fechas, no solo status)
    const isInActiveTrial = (suscripcion?.status === 'trial' && isTrialActiveByDate) || (trialInfo.isTrialActive && isTrialActiveByDate);
    
    // Si está bloqueado por administración
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
        dataWillBeDeleted: false,
        restrictionType: 'payment_suspended'
      };
    }

    // Si tiene suscripción activa PAGADA, usar permisos del plan
    if (suscripcion?.status === 'active' && suscripcion.plan && suscripcion?.fecha_vencimiento) {
      const planEndDate = new Date(suscripcion.fecha_vencimiento);
      const isPlanActive = planEndDate > now;
      
      if (!isPlanActive) {
        return {
          isInActiveTrial: false,
          isTrialExpired: true,
          isInGracePeriod: false,
          hasFullAccess: false,
          daysRemaining: 0,
          graceDaysRemaining: 0,
          trialStatus: 'expired',
          shouldShowUpgradeModal: true,
          dataWillBeDeleted: false,
          restrictionType: 'payment_suspended'
        };
      }

      return {
        isInActiveTrial: false,
        isTrialExpired: false,
        isInGracePeriod: false,
        hasFullAccess: true,
        daysRemaining: 0,
        graceDaysRemaining: 0,
        trialStatus: 'not_applicable',
        shouldShowUpgradeModal: false,
        dataWillBeDeleted: false,
        restrictionType: 'none'
      };
    }

    // Verificar si está en período de gracia
    if (suscripcion?.status === 'grace_period') {
      const gracePeriodEnd = suscripcion.grace_period_end ? new Date(suscripcion.grace_period_end) : null;
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
        dataWillBeDeleted: graceDaysRemaining <= 7,
        restrictionType: 'grace_period'
      };
    }

    // Trial expirado (nunca tuvo plan pagado)
    if (!isInActiveTrial && (trialInfo.isTrialExpired || !isTrialActiveByDate)) {
      return {
        isInActiveTrial: false,
        isTrialExpired: true,
        isInGracePeriod: false,
        hasFullAccess: false,
        daysRemaining: 0,
        graceDaysRemaining: 0,
        trialStatus: 'expired',
        shouldShowUpgradeModal: true,
        dataWillBeDeleted: false,
        restrictionType: 'trial_expired'
      };
    }

    // Trial activo
    return {
      isInActiveTrial: true,
      isTrialExpired: false,
      isInGracePeriod: false,
      hasFullAccess: true,
      daysRemaining: realDaysRemaining,
      graceDaysRemaining: 0,
      trialStatus: 'active',
      shouldShowUpgradeModal: false,
      dataWillBeDeleted: false,
      restrictionType: 'none'
    };
  }, [trialInfo, suscripcion, estaBloqueado, suscripcionVencida, isSuperuser]);

  const canPerformAction = (actionType: string) => {
    // Superusers pueden hacer todo
    if (isSuperuser) return true;
    
    // Durante trial activo, puede hacer todo
    if (trialState.hasFullAccess) return true;
    
    // En período de gracia, solo lectura
    if (trialState.isInGracePeriod) {
      return actionType === 'read' || actionType === 'view';
    }
    
    // Cualquier otra restricción bloquea acciones de creación/modificación
    return actionType === 'read' || actionType === 'view';
  };

  const getContextualMessage = () => {
    if (isSuperuser) return 'Acceso completo de superusuario';
    
    switch (trialState.restrictionType) {
      case 'trial_expired':
        return 'Su período de prueba ha finalizado. Le recomendamos adquirir un plan para continuar.';
      case 'payment_suspended':
        return 'Su cuenta está suspendida por falta de pago. Renueve su suscripción para continuar.';
      case 'grace_period':
        if (trialState.dataWillBeDeleted) {
          return `¡URGENTE! Sus datos serán eliminados en ${trialState.graceDaysRemaining} días.`;
        }
        return `Período de gracia: ${trialState.graceDaysRemaining} días restantes.`;
      case 'none':
        if (trialState.isInActiveTrial) {
          if (trialState.daysRemaining <= 3) {
            return `¡Solo ${trialState.daysRemaining} días de prueba restantes!`;
          }
          return `Período de prueba: ${trialState.daysRemaining} días restantes.`;
        }
        return 'Acceso completo disponible.';
      default:
        return 'Estado desconocido';
    }
  };

  const getUrgencyLevel = (): 'low' | 'medium' | 'high' | 'critical' => {
    if (trialState.dataWillBeDeleted) return 'critical';
    if (trialState.restrictionType === 'payment_suspended') return 'high';
    if (trialState.restrictionType === 'trial_expired') return 'high';
    if (trialState.isInGracePeriod && trialState.graceDaysRemaining <= 7) return 'high';
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
