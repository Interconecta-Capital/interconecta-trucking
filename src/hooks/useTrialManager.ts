
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useSuscripcion } from './useSuscripcion';

export const useTrialManager = () => {
  const { user } = useAuth();
  const { suscripcion, estaBloqueado, diasRestantesPrueba, diasRestantesGracia } = useSuscripcion();

  const trialStatus = useMemo(() => {
    if (!user || !suscripcion) {
      console.log('useTrialManager: No user or subscription');
      return {
        isInActiveTrial: false,
        isTrialExpired: true,
        isInGracePeriod: false,
        hasFullAccess: false,
        gracePeriodDaysLeft: 0,
        daysRemaining: 0,
        graceDaysRemaining: 0,
        dataWillBeDeleted: false
      };
    }

    const now = new Date();
    const trialEndDate = suscripcion.fecha_fin_prueba ? new Date(suscripcion.fecha_fin_prueba) : null;
    const gracePeriodEnd = suscripcion.grace_period_end ? new Date(suscripcion.grace_period_end) : null;

    const isInActiveTrial = suscripcion.status === 'trial' && trialEndDate && trialEndDate > now;
    const isTrialExpired = suscripcion.status === 'trial' && trialEndDate && trialEndDate <= now;
    const isInGracePeriod = suscripcion.status === 'grace_period' && gracePeriodEnd && gracePeriodEnd > now;
    const gracePeriodDaysLeft = Math.max(0, Math.ceil((gracePeriodEnd ? gracePeriodEnd.getTime() - now.getTime() : 0) / (1000 * 60 * 60 * 24)));

    // Usuario tiene acceso completo si está en trial activo o tiene suscripción activa
    const hasFullAccess = isInActiveTrial || suscripcion.status === 'active';

    // Calcular días restantes del trial
    const daysRemaining = isInActiveTrial ? diasRestantesPrueba() : 0;
    
    // Calcular días restantes del período de gracia
    const graceDaysRemaining = isInGracePeriod ? diasRestantesGracia() : 0;
    
    // Los datos serán eliminados si está en período de gracia y quedan menos de 3 días
    const dataWillBeDeleted = isInGracePeriod && graceDaysRemaining <= 3;

    const status = {
      isInActiveTrial,
      isTrialExpired,
      isInGracePeriod,
      hasFullAccess,
      gracePeriodDaysLeft,
      daysRemaining,
      graceDaysRemaining,
      dataWillBeDeleted
    };

    console.log('useTrialManager status:', {
      ...status,
      subscriptionStatus: suscripcion.status,
      trialEndDate: trialEndDate?.toISOString(),
      gracePeriodEnd: gracePeriodEnd?.toISOString(),
      estaBloqueado
    });

    return status;
  }, [user, suscripcion, diasRestantesPrueba, diasRestantesGracia]);

  const canPerformAction = (action: 'create' | 'edit' | 'delete' | 'view' = 'view') => {
    // Durante período de gracia, solo permitir lectura
    if (trialStatus.isInGracePeriod && action !== 'view') {
      console.log('useTrialManager: Grace period - only view allowed');
      return false;
    }

    // Si está bloqueado, no permitir ninguna acción
    if (estaBloqueado) {
      console.log('useTrialManager: User blocked');
      return false;
    }

    // Si tiene acceso completo, permitir todas las acciones
    const canPerform = trialStatus.hasFullAccess;
    console.log(`useTrialManager: canPerformAction(${action}) = ${canPerform}`);
    return canPerform;
  };

  return {
    ...trialStatus,
    canPerformAction
  };
};
