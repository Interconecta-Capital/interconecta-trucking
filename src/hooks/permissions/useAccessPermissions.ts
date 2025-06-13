
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { useTrialManager } from '@/hooks/useTrialManager';
import { FunctionalityType, PermissionResult } from '@/types/permissions';

export const useAccessPermissions = () => {
  const { tienePermiso, estaBloqueado, suscripcionVencida } = useSuscripcion();
  const { isInActiveTrial, isTrialExpired, isInGracePeriod } = useTrialManager();

  const puedeAcceder = (funcionalidad: FunctionalityType): PermissionResult => {
    // Durante trial activo, acceso completo a todas las funcionalidades
    if (isInActiveTrial) {
      return { puede: true, razon: undefined };
    }

    // Durante período de gracia, solo lectura
    if (isInGracePeriod) {
      return { 
        puede: false, 
        razon: 'Durante el período de gracia solo puede ver datos. Adquiera un plan para recuperar todas las funciones.' 
      };
    }

    if (estaBloqueado) {
      return { 
        puede: false, 
        razon: 'Su cuenta está bloqueada por falta de pago' 
      };
    }

    if (suscripcionVencida() || isTrialExpired) {
      return { 
        puede: false, 
        razon: 'Su período de prueba ha vencido o suscripción expirada' 
      };
    }

    // Lógica existente para usuarios con plan pagado
    switch (funcionalidad) {
      case 'cancelar_cfdi':
        return { 
          puede: tienePermiso('puede_cancelar_cfdi'),
          razon: !tienePermiso('puede_cancelar_cfdi') ? 'Esta función no está disponible en su plan actual' : undefined
        };
      
      case 'generar_xml':
        return { 
          puede: tienePermiso('puede_generar_xml'),
          razon: !tienePermiso('puede_generar_xml') ? 'Esta función no está disponible en su plan actual' : undefined
        };
      
      case 'timbrar':
        return { 
          puede: tienePermiso('puede_timbrar'),
          razon: !tienePermiso('puede_timbrar') ? 'Esta función no está disponible en su plan actual' : undefined
        };
      
      case 'tracking':
        return { 
          puede: tienePermiso('puede_tracking'),
          razon: !tienePermiso('puede_tracking') ? 'Esta función no está disponible en su plan actual' : undefined
        };

      case 'administracion':
        return { 
          puede: tienePermiso('puede_acceder_administracion'),
          razon: !tienePermiso('puede_acceder_administracion') ? 'Módulo de administración disponible desde Plan Gestión IA' : undefined
        };

      case 'funciones_avanzadas':
        return { 
          puede: tienePermiso('puede_acceder_funciones_avanzadas'),
          razon: !tienePermiso('puede_acceder_funciones_avanzadas') ? 'Funciones avanzadas disponibles desde Plan Automatización Total' : undefined
        };

      case 'enterprise':
        return { 
          puede: tienePermiso('puede_acceder_enterprise'),
          razon: !tienePermiso('puede_acceder_enterprise') ? 'Funciones enterprise disponibles solo en Plan Enterprise Sin Límites' : undefined
        };

      // Módulos básicos - generalmente disponibles en todos los planes
      case 'cartas_porte':
      case 'conductores':
      case 'vehiculos':
      case 'socios':
      case 'dashboard':
      case 'viajes':
        return { puede: true };
      
      default:
        return { puede: true };
    }
  };

  const puedeAccederAdministracion = (): PermissionResult => {
    return puedeAcceder('administracion');
  };

  const puedeAccederFuncionesAvanzadas = (): PermissionResult => {
    return puedeAcceder('funciones_avanzadas');
  };

  const puedeAccederEnterprise = (): PermissionResult => {
    return puedeAcceder('enterprise');
  };

  return {
    puedeAcceder,
    puedeAccederAdministracion,
    puedeAccederFuncionesAvanzadas,
    puedeAccederEnterprise
  };
};
