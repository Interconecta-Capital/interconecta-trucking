
import { useUnifiedPermissionsV2 } from '../useUnifiedPermissionsV2';

/**
 * Hook wrapper para compatibilidad - Usa useUnifiedPermissionsV2 internamente
 * @deprecated Usar useUnifiedPermissionsV2 directamente para nuevos desarrollos
 */
export const usePlanStatus = () => {
  const permissions = useUnifiedPermissionsV2();

  const getPlanActual = () => {
    return permissions.planInfo.name;
  };

  const getTipoPlan = () => {
    return permissions.planInfo.type;
  };

  const getPlanInfo = () => {
    return permissions.planInfo;
  };

  const isActivePlan = () => {
    return permissions.planInfo.isActive;
  };

  return {
    getPlanActual,
    getTipoPlan,
    getPlanInfo,
    isActivePlan
  };
};
