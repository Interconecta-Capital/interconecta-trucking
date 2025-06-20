
import { usePermissionCheck } from './useUnifiedAccessControl';

// Hook de compatibilidad que mantiene la interfaz original
// pero usa el nuevo sistema unificado
export const useEnhancedPermissions = () => {
  const accessControl = usePermissionCheck();

  const puedeAcceder = (recurso: string) => {
    const puede = accessControl.canAccessResource(recurso as any) || accessControl.canViewContent;
    return { 
      puede, 
      razon: puede ? undefined : accessControl.statusMessage 
    };
  };

  const puedeCrear = (tipo: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios') => {
    const puede = accessControl.canCreateResource(tipo);
    return { 
      puede, 
      razon: puede ? undefined : accessControl.actionRequired || accessControl.statusMessage
    };
  };

  const puedeAccederAdministracion = () => {
    const puede = accessControl.isSuperuser || accessControl.hasFullAccess;
    return { 
      puede, 
      razon: puede ? undefined : 'Requiere acceso completo'
    };
  };

  const puedeAccederFuncionesAvanzadas = () => {
    const puede = accessControl.isSuperuser || accessControl.hasFullAccess;
    return { 
      puede, 
      razon: puede ? undefined : 'Requiere plan con funciones avanzadas'
    };
  };

  const puedeAccederEnterprise = () => {
    const puede = accessControl.isSuperuser || (accessControl.hasFullAccess && accessControl.planName.includes('Enterprise'));
    return { 
      puede, 
      razon: puede ? undefined : 'Requiere plan Enterprise'
    };
  };

  const obtenerLimites = () => accessControl.limits;

  const obtenerUsoActual = () => ({
    cartas_porte: { usado: 0, limite: accessControl.limits.cartas_porte },
    conductores: { usado: 0, limite: accessControl.limits.conductores },
    vehiculos: { usado: 0, limite: accessControl.limits.vehiculos },
    socios: { usado: 0, limite: accessControl.limits.socios }
  });

  return {
    // Funciones principales
    puedeAcceder,
    puedeCrear,
    obtenerLimites,
    obtenerUsoActual,
    
    // Estados
    estaBloqueado: accessControl.isBlocked,
    suscripcionVencida: accessControl.isTrialExpired && !accessControl.isInActiveTrial,
    planActual: accessControl.planName,
    
    // Funciones específicas
    puedeAccederAdministracion,
    puedeAccederFuncionesAvanzadas,
    puedeAccederEnterprise,
    
    // Estados del trial
    isInActiveTrial: accessControl.isInActiveTrial,
    isTrialExpired: accessControl.isTrialExpired,
    isInGracePeriod: accessControl.restrictionType === 'grace_period',
    hasFullAccess: accessControl.hasFullAccess,
    canPerformAction: accessControl.canPerformAction,
    isSuperuser: accessControl.isSuperuser,
    restrictionType: accessControl.restrictionType
  };
};
