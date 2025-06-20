
import { useSuscripcion } from '../useSuscripcion';
import { useSuperuser } from '../useSuperuser';
import { useTrialManager } from '../useTrialManager';

export const useAccessPermissions = () => {
  const { suscripcion } = useSuscripcion();
  const { isSuperuser } = useSuperuser();
  const { hasFullAccess, canPerformAction } = useTrialManager();

  const puedeAcceder = (recurso: string): boolean => {
    // Superusers siempre pueden acceder
    if (isSuperuser) return true;
    
    // Si no tiene acceso completo, solo permitir recursos básicos de solo lectura
    if (!hasFullAccess) {
      const recursosBasicosLectura = [
        'dashboard', 
        'profile', 
        'planes', 
        'logout',
        'view_cartas_porte',
        'view_conductores', 
        'view_vehiculos',
        'view_socios'
      ];
      return recursosBasicosLectura.some(basico => recurso.includes(basico) || recurso.includes('view'));
    }

    // Con acceso completo, puede acceder a todo según su plan
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
