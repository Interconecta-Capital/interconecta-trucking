
import { useUnifiedPermissionsV2 } from './useUnifiedPermissionsV2';
import { useAccessPermissions } from './permissions/useAccessPermissions';
import { useResourceLimits } from './permissions/useResourceLimits';
import { usePlanStatus } from './permissions/usePlanStatus';

/**
 * @deprecated - Usar useUnifiedPermissionsV2 en su lugar
 * Hook mantenido por compatibilidad durante la migración
 * 
 * IMPORTANTE: Este hook ahora es un simple wrapper de useUnifiedPermissionsV2
 * para mantener compatibilidad con componentes existentes durante la migración.
 * Para nuevos desarrollos, usar useUnifiedPermissionsV2 directamente.
 */
export const usePermisosSubscripcion = () => {
  const permissions = useUnifiedPermissionsV2();
  
  // Usar hooks especializados (que ahora son wrappers)
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
    estaBloqueado: permissions.accessLevel === 'blocked',
    suscripcionVencida: permissions.accessLevel === 'expired',
    planActual: getPlanActual(),
    // Funciones específicas
    puedeAccederAdministracion,
    puedeAccederFuncionesAvanzadas,
    puedeAccederEnterprise,
    // Propiedades del trial y período de gracia (mapeo desde el sistema unificado)
    isInActiveTrial: permissions.accessLevel === 'trial',
    isTrialExpired: permissions.accessLevel === 'expired',
    isInGracePeriod: false, // Simplificado por ahora
    hasFullAccess: permissions.hasFullAccess,
    canPerformAction: permissions.canPerformAction
  };
};
