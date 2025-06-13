
import { useMemo } from 'react';
import { usePermisosSubscripcion } from './usePermisosSubscripcion';
import { useSuperuser } from './useSuperuser';

export const useEnhancedPermissions = () => {
  const { isSuperuser } = useSuperuser();
  const subscriptionPermissions = usePermisosSubscripcion();

  // Override all permissions for superusers
  const enhancedPermissions = useMemo(() => {
    if (isSuperuser) {
      return {
        ...subscriptionPermissions,
        puedeAcceder: () => ({ puede: true, razon: undefined }),
        puedeCrear: () => ({ puede: true, razon: undefined }),
        puedeAccederAdministracion: () => ({ puede: true, razon: undefined }),
        puedeAccederFuncionesAvanzadas: () => ({ puede: true, razon: undefined }),
        puedeAccederEnterprise: () => ({ puede: true, razon: undefined }),
        estaBloqueado: false,
        suscripcionVencida: false,
        planActual: 'Enterprise Sin Límites (Superuser)',
        obtenerLimites: () => ({
          cartas_porte: null,
          conductores: null,
          vehiculos: null,
          socios: null,
        }),
        obtenerUsoActual: () => ({
          cartas_porte: { usado: 0, limite: null },
          conductores: { usado: 0, limite: null },
          vehiculos: { usado: 0, limite: null },
          socios: { usado: 0, limite: null },
        })
      };
    }

    return subscriptionPermissions;
  }, [isSuperuser, subscriptionPermissions]);

  return {
    ...enhancedPermissions,
    isSuperuser
  };
};
