
import { useUnifiedPermissionsV2 } from '../useUnifiedPermissionsV2';

/**
 * Hook wrapper para compatibilidad - Usa useUnifiedPermissionsV2 internamente
 * @deprecated Usar useUnifiedPermissionsV2 directamente para nuevos desarrollos
 */
export const useAccessPermissions = () => {
  const permissions = useUnifiedPermissionsV2();

  const puedeAcceder = (funcionalidad: string) => {
    // Superusuarios pueden acceder a todo
    if (permissions.accessLevel === 'superuser') {
      return { puede: true, razon: 'Acceso de Superusuario' };
    }

    // Trial activo: acceso total
    if (permissions.accessLevel === 'trial') {
      return { puede: true, razon: 'Acceso durante período de prueba' };
    }

    // Plan pagado: verificar acceso
    if (permissions.accessLevel === 'paid') {
      return { 
        puede: permissions.hasFullAccess, 
        razon: permissions.hasFullAccess ? 'Incluido en su plan' : 'No incluido en su plan actual' 
      };
    }

    // Sin acceso en otros casos
    return { 
      puede: false, 
      razon: permissions.accessReason 
    };
  };

  const puedeAccederAdministracion = () => {
    return puedeAcceder('administracion');
  };

  const puedeAccederFuncionesAvanzadas = () => {
    return puedeAcceder('funciones_avanzadas');
  };

  const puedeAccederEnterprise = () => {
    return puedeAcceder('enterprise');
  };

  return {
    puedeAcceder,
    puedeAccederAdministracion,
    puedeAccederFuncionesAvanzadas,
    puedeAccederEnterprise
  };
};
