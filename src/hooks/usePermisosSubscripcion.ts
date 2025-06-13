
import { useSuscripcion } from './useSuscripcion';
import { useConductores } from './useConductores';
import { useVehiculos } from './useVehiculos';
import { useSocios } from './useSocios';
import { useCartasPorte } from './useCartasPorte';
import { useTrialManager } from './useTrialManager';

export const usePermisosSubscripcion = () => {
  const { 
    suscripcion, 
    tienePermiso, 
    verificarLimite, 
    estaBloqueado,
    suscripcionVencida 
  } = useSuscripcion();
  
  const { conductores } = useConductores();
  const { vehiculos } = useVehiculos();
  const { socios } = useSocios();
  const { cartasPorte } = useCartasPorte();
  const { isInActiveTrial, isTrialExpired, hasFullAccess, canPerformAction } = useTrialManager();

  // Verificar si puede acceder a una funcionalidad
  const puedeAcceder = (funcionalidad: string): { puede: boolean; razon?: string } => {
    // Durante trial activo, acceso completo a todas las funcionalidades
    if (isInActiveTrial) {
      return { puede: true, razon: undefined };
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
      
      default:
        return { puede: true };
    }
  };

  // Nuevas funciones específicas para módulos
  const puedeAccederAdministracion = (): { puede: boolean; razon?: string } => {
    return puedeAcceder('administracion');
  };

  const puedeAccederFuncionesAvanzadas = (): { puede: boolean; razon?: string } => {
    return puedeAcceder('funciones_avanzadas');
  };

  const puedeAccederEnterprise = (): { puede: boolean; razon?: string } => {
    return puedeAcceder('enterprise');
  };

  // Verificar si puede crear nuevos registros
  const puedeCrear = (tipo: 'conductores' | 'vehiculos' | 'socios' | 'cartas_porte'): { puede: boolean; razon?: string } => {
    // Durante trial activo, sin límites
    if (isInActiveTrial) {
      return { puede: true, razon: undefined };
    }

    if (estaBloqueado) {
      return { 
        puede: false, 
        razon: 'Su cuenta está bloqueada por falta de pago' 
      };
    }

    if (isTrialExpired && !suscripcion?.plan) {
      return {
        puede: false,
        razon: 'Su período de prueba ha vencido. Actualice su plan para continuar creando registros.'
      };
    }

    // Lógica existente para usuarios con plan pagado
    let cantidad = 0;
    switch (tipo) {
      case 'conductores':
        cantidad = conductores?.length || 0;
        break;
      case 'vehiculos':
        cantidad = vehiculos?.length || 0;
        break;
      case 'socios':
        cantidad = socios?.length || 0;
        break;
      case 'cartas_porte':
        cantidad = cartasPorte?.length || 0;
        break;
    }

    const puedeCrearPorLimite = verificarLimite(tipo, cantidad);
    
    if (!puedeCrearPorLimite) {
      const limite = suscripcion?.plan?.[`limite_${tipo}`];
      return {
        puede: false,
        razon: `Ha alcanzado el límite de ${limite} ${tipo.replace('_', ' ')} para su plan actual`
      };
    }

    return { puede: true };
  };

  // Obtener límites del plan actual
  const obtenerLimites = () => {
    // Durante trial activo, sin límites
    if (isInActiveTrial) {
      return {
        cartas_porte: null,
        conductores: null,
        vehiculos: null,
        socios: null,
      };
    }

    if (!suscripcion?.plan) return {};

    return {
      cartas_porte: suscripcion.plan.limite_cartas_porte,
      conductores: suscripcion.plan.limite_conductores,
      vehiculos: suscripcion.plan.limite_vehiculos,
      socios: suscripcion.plan.limite_socios,
    };
  };

  // Obtener uso actual vs límites
  const obtenerUsoActual = () => {
    const limites = obtenerLimites();
    
    return {
      cartas_porte: {
        usado: cartasPorte?.length || 0,
        limite: limites.cartas_porte || null
      },
      conductores: {
        usado: conductores?.length || 0,
        limite: limites.conductores || null
      },
      vehiculos: {
        usado: vehiculos?.length || 0,
        limite: limites.vehiculos || null
      },
      socios: {
        usado: socios?.length || 0,
        limite: limites.socios || null
      },
    };
  };

  // Determinar el nombre del plan actual
  const getPlanActual = () => {
    if (isInActiveTrial) {
      return 'Trial Completo (14 días)';
    }
    
    if (isTrialExpired && !suscripcion?.plan) {
      return 'Sin Plan';
    }
    
    return suscripcion?.plan?.nombre || 'Sin plan';
  };

  return {
    puedeAcceder,
    puedeCrear,
    obtenerLimites,
    obtenerUsoActual,
    estaBloqueado,
    suscripcionVencida: suscripcionVencida() || isTrialExpired,
    planActual: getPlanActual(),
    // Nuevas funciones específicas
    puedeAccederAdministracion,
    puedeAccederFuncionesAvanzadas,
    puedeAccederEnterprise,
    // Nuevas propiedades del trial
    isInActiveTrial,
    isTrialExpired,
    hasFullAccess,
    canPerformAction
  };
};
