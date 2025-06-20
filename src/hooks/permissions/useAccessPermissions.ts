
import { useSuscripcion } from '../useSuscripcion';
import { useSuperuser } from '../useSuperuser';
import { useTrialManager } from '../useTrialManager';

export const useAccessPermissions = () => {
  const { suscripcion } = useSuscripcion();
  const { isSuperuser } = useSuperuser();
  const { hasFullAccess } = useTrialManager();

  const puedeAcceder = (recurso: string): boolean => {
    if (isSuperuser) return true;
    if (hasFullAccess) return true;
    
    // Durante trial o plan activo, acceso básico garantizado
    if (suscripcion?.status === 'trial' || suscripcion?.status === 'active') {
      return true;
    }

    // Recursos básicos siempre disponibles
    const recursosBasicos = ['dashboard', 'profile', 'carta-porte', 'logout'];
    return recursosBasicos.some(basico => recurso.includes(basico));
  };

  const puedeAccederAdministracion = (): boolean => {
    if (isSuperuser) return true;
    return suscripcion?.plan?.puede_acceder_administracion || false;
  };

  const puedeAccederFuncionesAvanzadas = (): boolean => {
    if (isSuperuser) return true;
    return suscripcion?.plan?.puede_acceder_funciones_avanzadas || false;
  };

  const puedeAccederEnterprise = (): boolean => {
    if (isSuperuser) return true;
    return suscripcion?.plan?.puede_acceder_enterprise || false;
  };

  return {
    puedeAcceder,
    puedeAccederAdministracion,
    puedeAccederFuncionesAvanzadas,
    puedeAccederEnterprise
  };
};
