
import { useSuscripcion } from './useSuscripcion';
import { useTrialManager } from './useTrialManager';
import { useAccessPermissions } from './permissions/useAccessPermissions';
import { useResourceLimits } from './permissions/useResourceLimits';
import { usePlanStatus } from './permissions/usePlanStatus';

/**
 * @deprecated - Usar useUnifiedPermissions en su lugar
 * Hook mantenido por compatibilidad durante la migración
 */
export const usePermisosSubscripcion = () => {
  const { 
    estaBloqueado,
    suscripcionVencida: suscripcionVencidaFn
  } = useSuscripcion();
  
  const { 
    isInActiveTrial, 
    isTrialExpired, 
    isInGracePeriod,
    hasFullAccess, 
    canPerformAction 
  } = useTrialManager();

  // Usar hooks especializados
  const {
    puedeAcceder,
    puedeAccederAdministracion,
    puedeAccederFuncionesAvanzadas,
    puedeAccederEnterprise
  } = useAccessPermissions();

  const {
    puedeCrear,
    obtenerLimites,
    obtenerUsoActual
  } = useResourceLimits();

  const { getPlanActual } = usePlanStatus();

  return {
    puedeAcceder,
    puedeCrear,
    obtenerLimites,
    obtenerUsoActual,
    estaBloqueado,
    suscripcionVencida: suscripcionVencidaFn() || (isTrialExpired && !isInGracePeriod),
    planActual: getPlanActual(),
    // Funciones específicas
    puedeAccederAdministracion,
    puedeAccederFuncionesAvanzadas,
    puedeAccederEnterprise,
    // Propiedades del trial y período de gracia
    isInActiveTrial,
    isTrialExpired,
    isInGracePeriod,
    hasFullAccess,
    canPerformAction
  };
};
