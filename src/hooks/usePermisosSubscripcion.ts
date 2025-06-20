
import { useSuscripcion } from './useSuscripcion';
import { useTrialManager } from './useTrialManager';
import { useAccessPermissions } from './permissions/useAccessPermissions';
import { useResourceLimits } from './permissions/useResourceLimits';
import { usePlanStatus } from './permissions/usePlanStatus';
import { useSuperuser } from './useSuperuser';

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

  const { isSuperuser } = useSuperuser();

  // Usar hooks especializados
  const {
    puedeAcceder: puedeAccederBase,
    puedeAccederAdministracion: puedeAccederAdministracionBase,
    puedeAccederFuncionesAvanzadas: puedeAccederFuncionesAvanzadasBase,
    puedeAccederEnterprise: puedeAccederEnterpriseBase
  } = useAccessPermissions();

  const {
    puedeCrear: puedeCrearBase,
    obtenerLimites,
    obtenerUsoActual: obtenerUsoActualBase
  } = useResourceLimits();

  const { getPlanActual } = usePlanStatus();

  // Wrapper functions that return the expected format
  const puedeAcceder = (recurso: string) => {
    if (isSuperuser) return { puede: true, razon: undefined };
    const puede = puedeAccederBase(recurso);
    return { puede, razon: puede ? undefined : 'Acceso denegado' };
  };

  const puedeCrear = (tipo: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios') => {
    if (isSuperuser) return { puede: true, razon: undefined };
    const puede = puedeCrearBase(tipo);
    if (!puede) {
      const limites = obtenerLimites();
      const uso = obtenerUsoActualBase();
      const limite = limites[tipo];
      const actual = uso[tipo] || 0;
      return { 
        puede: false, 
        razon: limite ? `Límite alcanzado: ${actual}/${limite} ${tipo.replace('_', ' ')}` : 'No se puede crear' 
      };
    }
    return { puede: true, razon: undefined };
  };

  const puedeAccederAdministracion = () => {
    if (isSuperuser) return { puede: true, razon: undefined };
    const puede = puedeAccederAdministracionBase();
    return { puede, razon: puede ? undefined : 'Requiere plan con acceso a administración' };
  };

  const puedeAccederFuncionesAvanzadas = () => {
    if (isSuperuser) return { puede: true, razon: undefined };
    const puede = puedeAccederFuncionesAvanzadasBase();
    return { puede, razon: puede ? undefined : 'Requiere plan con funciones avanzadas' };
  };

  const puedeAccederEnterprise = () => {
    if (isSuperuser) return { puede: true, razon: undefined };
    const puede = puedeAccederEnterpriseBase();
    return { puede, razon: puede ? undefined : 'Requiere plan Enterprise' };
  };

  // Format usage data consistently
  const obtenerUsoActual = (tipo?: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios') => {
    const usoRaw = obtenerUsoActualBase(tipo);
    const limites = obtenerLimites();
    
    if (tipo) {
      return {
        usado: usoRaw || 0,
        limite: limites[tipo]
      };
    }
    
    return {
      cartas_porte: { usado: usoRaw.cartas_porte || 0, limite: limites.cartas_porte },
      conductores: { usado: usoRaw.conductores || 0, limite: limites.conductores },
      vehiculos: { usado: usoRaw.vehiculos || 0, limite: limites.vehiculos },
      socios: { usado: usoRaw.socios || 0, limite: limites.socios }
    };
  };

  const planActual = getPlanActual();
  const planNombre = typeof planActual === 'string' ? planActual : planActual?.nombre || 'Plan Básico';

  return {
    puedeAcceder,
    puedeCrear,
    obtenerLimites,
    obtenerUsoActual,
    estaBloqueado,
    suscripcionVencida: suscripcionVencidaFn() || (isTrialExpired && !isInGracePeriod),
    planActual: planNombre,
    // Funciones específicas
    puedeAccederAdministracion,
    puedeAccederFuncionesAvanzadas,
    puedeAccederEnterprise,
    // Propiedades del trial y período de gracia
    isInActiveTrial,
    isTrialExpired,
    isInGracePeriod,
    hasFullAccess,
    canPerformAction,
    isSuperuser
  };
};
