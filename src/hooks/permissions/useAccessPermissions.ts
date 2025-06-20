
import { useSuscripcion } from '../useSuscripcion';
import { useSuperuser } from '../useSuperuser';
import { useTrialManager } from '../useTrialManager';

export const useAccessPermissions = () => {
  const { suscripcion } = useSuscripcion();
  const { isSuperuser } = useSuperuser();
  const { hasFullAccess, canPerformAction } = useTrialManager();

  const puedeAcceder = (recurso: string): boolean => {
    if (isSuperuser) return true;
    
    // Usar la lógica centralizada del trial manager
    if (!hasFullAccess) {
      // Solo permitir acceso a recursos básicos de lectura cuando no hay acceso completo
      const recursosBasicosLectura = ['dashboard', 'profile', 'planes', 'logout'];
      return recursosBasicosLectura.some(basico => recurso.includes(basico));
    }

    return true;
  };

  const puedeAccederAdministracion = (): boolean => {
    if (isSuperuser) return true;
    if (!hasFullAccess) return false;
    return suscripcion?.plan?.puede_acceder_administracion || false;
  };

  const puedeAccederFuncionesAvanzadas = (): boolean => {
    if (isSuperuser) return true;
    if (!hasFullAccess) return false;
    return suscripcion?.plan?.puede_acceder_funciones_avanzadas || false;
  };

  const puedeAccederEnterprise = (): boolean => {
    if (isSuperuser) return true;
    if (!hasFullAccess) return false;
    return suscripcion?.plan?.puede_acceder_enterprise || false;
  };

  return {
    puedeAcceder,
    puedeAccederAdministracion,
    puedeAccederFuncionesAvanzadas,
    puedeAccederEnterprise
  };
};
