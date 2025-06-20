
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
    console.log('🔍 TrialManager - Evaluating state:', {
      isSuperuser,
      suscripcion: suscripcion ? {
        status: suscripcion.status,
        fecha_fin_prueba: suscripcion.fecha_fin_prueba,
        fecha_vencimiento: suscripcion.fecha_vencimiento,
        grace_period_end: suscripcion.grace_period_end
      } : null,
      trialInfo,
      estaBloqueado,
      suscripcionVencida: typeof suscripcionVencida === 'function' ? suscripcionVencida() : suscripcionVencida
    });

    // Superusers siempre tienen acceso completo
    if (isSuperuser) {
      console.log('✅ Superuser detected - granting full access');
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

    const now = new Date();
    
    // Verificar fechas reales del trial/suscripción
    const trialEndDate = trialInfo?.trialEndDate || (suscripcion?.fecha_fin_prueba ? new Date(suscripcion.fecha_fin_prueba) : null);
    const planEndDate = suscripcion?.fecha_vencimiento ? new Date(suscripcion.fecha_vencimiento) : null;
    
    // Calcular días restantes basado en fechas reales
    const realDaysRemaining = trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
    const graceDaysRemaining = suscripcion?.grace_period_end ? Math.max(0, Math.ceil((new Date(suscripcion.grace_period_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

    console.log('📅 Date calculations:', {
      now: now.toISOString(),
      trialEndDate: trialEndDate?.toISOString(),
      planEndDate: planEndDate?.toISOString(),
      realDaysRemaining,
      graceDaysRemaining
    });

    // Si está bloqueado explícitamente por administración
    if (estaBloqueado) {
      console.log('🚫 User is explicitly blocked by admin');
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

    // Si tiene suscripción activa PAGADA
    if (suscripcion?.status === 'active' && suscripcion.plan && planEndDate) {
      const isPlanActive = planEndDate > now;
      console.log('💳 Checking paid subscription:', { isPlanActive, planEndDate: planEndDate.toISOString() });
      
      if (!isPlanActive) {
        console.log('❌ Paid subscription expired');
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

      console.log('✅ Paid subscription is active');
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
    if (suscripcion?.status === 'grace_period' && suscripcion.grace_period_end) {
      const gracePeriodEnd = new Date(suscripcion.grace_period_end);
      const isInGracePeriod = gracePeriodEnd > now;
      console.log('⏰ Checking grace period:', { isInGracePeriod, gracePeriodEnd: gracePeriodEnd.toISOString() });
      
      if (isInGracePeriod) {
        return {
          isInActiveTrial: false,
          isTrialExpired: true,
          isInGracePeriod: true,
          hasFullAccess: false,
          daysRemaining: 0,
          graceDaysRemaining,
          trialStatus: 'grace_period',
          shouldShowUpgradeModal: true,
          dataWillBeDeleted: graceDaysRemaining <= 7,
          restrictionType: 'grace_period'
        };
      }
    }

    // Verificar trial activo basado en fechas reales Y status
    const isTrialActiveByDate = trialEndDate ? trialEndDate > now : false;
    const isTrialActiveByStatus = suscripcion?.status === 'trial';
    const isInActiveTrial = isTrialActiveByStatus && isTrialActiveByDate;

    console.log('🎯 Trial verification:', {
      isTrialActiveByDate,
      isTrialActiveByStatus,
      isInActiveTrial,
      realDaysRemaining
    });

    // Trial activo
    if (isInActiveTrial) {
      console.log('✅ Active trial detected');
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
    }

    // Trial expirado (basado en fechas reales O status)
    if ((!isInActiveTrial && trialEndDate && trialEndDate <= now) || suscripcion?.status === 'past_due') {
      console.log('❌ Trial expired detected');
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

    // Estado por defecto: revisar si realmente no tiene trial
    console.log('⚠️ Default state - checking if user has trial setup');
    
    // Si no hay suscripción en absoluto, asumir que puede estar en proceso de setup
    if (!suscripcion) {
      console.log('🔄 No subscription found - assuming trial setup in progress');
      return {
        isInActiveTrial: true, // Dar beneficio de la duda
        isTrialExpired: false,
        isInGracePeriod: false,
        hasFullAccess: true,
        daysRemaining: 14, // Asumir trial completo
        graceDaysRemaining: 0,
        trialStatus: 'active',
        shouldShowUpgradeModal: false,
        dataWillBeDeleted: false,
        restrictionType: 'none'
      };
    }

    // Estado por defecto final: sin acceso
    console.log('❌ No valid state found - denying access');
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
  }, [trialInfo, suscripcion, estaBloqueado, suscripcionVencida, isSuperuser]);

  const canPerformAction = (actionType: string) => {
    // Superusers pueden hacer todo
    if (isSuperuser) return true;
    
    // Durante trial activo o plan pagado activo, puede hacer todo
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
        return 'Su período de prueba ha finalizado. Adquiera un plan para continuar usando todas las funciones.';
      case 'payment_suspended':
        return 'Su cuenta está suspendida por falta de pago. Renueve su suscripción para continuar.';
      case 'grace_period':
        if (trialState.dataWillBeDeleted) {
          return `¡URGENTE! Sus datos serán eliminados en ${trialState.graceDaysRemaining} días.`;
        }
        return `Período de gracia: ${trialState.graceDaysRemaining} días restantes para renovar.`;
      case 'none':
        if (trialState.isInActiveTrial) {
          if (trialState.daysRemaining <= 3) {
            return `¡Solo ${trialState.daysRemaining} días de prueba restantes!`;
          }
          return `Período de prueba: ${trialState.daysRemaining} días restantes.`;
        }
        return 'Acceso completo disponible.';
      default:
        return 'Estado de cuenta indeterminado';
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

  console.log('📊 TrialManager final state:', {
    ...trialState,
    contextualMessage: getContextualMessage(),
    urgencyLevel: getUrgencyLevel()
  });

  return {
    ...trialState,
    loading: trialLoading,
    canPerformAction,
    getContextualMessage,
    getUrgencyLevel
  };
};
