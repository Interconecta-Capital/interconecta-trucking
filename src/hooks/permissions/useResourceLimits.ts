
import { useUnifiedPermissionsV2 } from '../useUnifiedPermissionsV2';

/**
 * Hook wrapper para compatibilidad - Usa useUnifiedPermissionsV2 internamente
 * @deprecated Usar useUnifiedPermissionsV2 directamente para nuevos desarrollos
 */
export const useResourceLimits = () => {
  const permissions = useUnifiedPermissionsV2();

  const puedeCrear = (recurso: 'conductores' | 'vehiculos' | 'socios' | 'cartas_porte') => {
    // Superusuarios pueden crear sin límites
    if (permissions.accessLevel === 'superuser') {
      return { puede: true, razon: 'Acceso de Superusuario' };
    }

    // Obtener permiso específico del recurso
    const resourcePermission = permissions.getPermissionForResource(recurso);
    
    return {
      puede: resourcePermission.allowed,
      razon: resourcePermission.reason
    };
  };

  const obtenerLimites = () => {
    return {
      conductores: permissions.usage.conductores.limit,
      vehiculos: permissions.usage.vehiculos.limit,
      socios: permissions.usage.socios.limit,
      cartas_porte: permissions.usage.cartas_porte.limit
    };
  };

  const obtenerUsoActual = () => {
    return {
      conductores: {
        usado: permissions.usage.conductores.used,
        limite: permissions.usage.conductores.limit
      },
      vehiculos: {
        usado: permissions.usage.vehiculos.used,
        limite: permissions.usage.vehiculos.limit
      },
      socios: {
        usado: permissions.usage.socios.used,
        limite: permissions.usage.socios.limit
      },
      cartas_porte: {
        usado: permissions.usage.cartas_porte.used,
        limite: permissions.usage.cartas_porte.limit
      }
    };
  };

  return {
    puedeCrear,
    obtenerLimites,
    obtenerUsoActual
  };
};
