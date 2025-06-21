
import { useMemo } from 'react';
import { useSuscripcion } from './useSuscripcion';
import { useTrialManager } from './useTrialManager';
import { useSuperuser } from './useSuperuser';
import { useConductores } from './useConductores';
import { useVehiculos } from './useVehiculos';
import { useSocios } from './useSocios';
import { useCartasPorte } from './useCartasPorte';
import { ResourceType, PermissionResult, FunctionalityType } from '@/types/permissions';

export const useUnifiedPermissions = () => {
  const { isSuperuser } = useSuperuser();
  const { suscripcion, verificarLimite, estaBloqueado, suscripcionVencida } = useSuscripcion();
  const { 
    isInActiveTrial, 
    isTrialExpired, 
    isInGracePeriod,
    canPerformAction: trialCanPerformAction
  } = useTrialManager();
  
  // Data hooks para conteos
  const { conductores } = useConductores();
  const { vehiculos } = useVehiculos();
  const { socios } = useSocios();
  const { cartasPorte } = useCartasPorte();

  // Memoizar el estado principal para evitar re-renders innecesarios
  const permissionState = useMemo(() => {
    // SUPERUSUARIOS: Acceso total sin restricciones
    if (isSuperuser) {
      return {
        hasFullAccess: true,
        planActual: 'Enterprise Sin Límites (Superuser)',
        isBlocked: false,
        isExpired: false,
        isInGrace: false,
        isInTrial: false
      };
    }

    // USUARIOS NORMALES: Aplicar lógica de suscripción/trial
    return {
      hasFullAccess: isInActiveTrial || (suscripcion?.status === 'active'),
      planActual: isInActiveTrial 
        ? `Trial (${Math.max(0, 14 - Math.floor((Date.now() - new Date(suscripcion?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))} días restantes)`
        : suscripcion?.plan?.nombre || 'Sin Plan',
      isBlocked: estaBloqueado,
      isExpired: isTrialExpired && !isInGracePeriod,
      isInGrace: isInGracePeriod,
      isInTrial: isInActiveTrial
    };
  }, [isSuperuser, isInActiveTrial, suscripcion, estaBloqueado, isTrialExpired, isInGracePeriod]);

  // Función unificada para verificar permisos de creación
  const puedeCrear = (tipo: ResourceType): PermissionResult => {
    // Superusuarios pueden crear todo
    if (isSuperuser) {
      return { puede: true };
    }

    // Durante trial activo, sin límites
    if (permissionState.isInTrial) {
      return { puede: true };
    }

    // Durante período de gracia, solo lectura
    if (permissionState.isInGrace) {
      return { 
        puede: false, 
        razon: 'Durante el período de gracia no puede crear nuevos registros. Adquiera un plan para recuperar todas las funciones.' 
      };
    }

    // Si está bloqueado
    if (permissionState.isBlocked) {
      return { 
        puede: false, 
        razon: 'Su cuenta está bloqueada por falta de pago' 
      };
    }

    // Si trial expiró y no tiene plan
    if (permissionState.isExpired) {
      return {
        puede: false,
        razon: 'Su período de prueba ha vencido. Actualice su plan para continuar creando registros.'
      };
    }

    // Con plan activo, verificar límites
    if (suscripcion?.status === 'active' && suscripcion.plan) {
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
        const limite = suscripcion.plan[`limite_${tipo}`];
        return {
          puede: false,
          razon: `Ha alcanzado el límite de ${limite} ${tipo.replace('_', ' ')} para su plan actual`
        };
      }

      return { puede: true };
    }

    // Por defecto, no puede crear
    return { puede: false, razon: 'No tiene permisos para crear este recurso' };
  };

  // Función unificada para verificar acceso a funcionalidades
  const puedeAcceder = (funcionalidad: FunctionalityType): PermissionResult => {
    // Superusuarios pueden acceder a todo
    if (isSuperuser) {
      return { puede: true };
    }

    // Durante trial activo, acceso completo
    if (permissionState.isInTrial) {
      return { puede: true };
    }

    // Durante período de gracia, solo lectura
    if (permissionState.isInGrace) {
      return { 
        puede: false, 
        razon: 'Durante el período de gracia solo puede ver datos. Adquiera un plan para recuperar todas las funciones.' 
      };
    }

    // Si está bloqueado o expirado
    if (permissionState.isBlocked || permissionState.isExpired) {
      return { 
        puede: false, 
        razon: permissionState.isBlocked 
          ? 'Su cuenta está bloqueada por falta de pago'
          : 'Su período de prueba ha vencido o suscripción expirada'
      };
    }

    // Con plan activo, verificar permisos específicos
    if (suscripcion?.status === 'active' && suscripcion.plan) {
      switch (funcionalidad) {
        case 'cancelar_cfdi':
          return { 
            puede: suscripcion.plan.puede_cancelar_cfdi,
            razon: !suscripcion.plan.puede_cancelar_cfdi ? 'Esta función no está disponible en su plan actual' : undefined
          };
        case 'generar_xml':
          return { 
            puede: suscripcion.plan.puede_generar_xml,
            razon: !suscripcion.plan.puede_generar_xml ? 'Esta función no está disponible en su plan actual' : undefined
          };
        case 'timbrar':
          return { 
            puede: suscripcion.plan.puede_timbrar,
            razon: !suscripcion.plan.puede_timbrar ? 'Esta función no está disponible en su plan actual' : undefined
          };
        case 'tracking':
          return { 
            puede: suscripcion.plan.puede_tracking,
            razon: !suscripcion.plan.puede_tracking ? 'Esta función no está disponible en su plan actual' : undefined
          };
        case 'administracion':
          return { 
            puede: suscripcion.plan.puede_acceder_administracion,
            razon: !suscripcion.plan.puede_acceder_administracion ? 'Módulo de administración disponible desde Plan Gestión IA' : undefined
          };
        case 'funciones_avanzadas':
          return { 
            puede: suscripcion.plan.puede_acceder_funciones_avanzadas,
            razon: !suscripcion.plan.puede_acceder_funciones_avanzadas ? 'Funciones avanzadas disponibles desde Plan Automatización Total' : undefined
          };
        case 'enterprise':
          return { 
            puede: suscripcion.plan.puede_acceder_enterprise,
            razon: !suscripcion.plan.puede_acceder_enterprise ? 'Funciones enterprise disponibles solo en Plan Enterprise Sin Límites' : undefined
          };
        // Módulos básicos
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
    }

    return { puede: false, razon: 'No tiene permisos para acceder a esta funcionalidad' };
  };

  // Función unificada para verificar si puede realizar acciones (wrapper de trial manager)
  const canPerformAction = (action: 'create' | 'edit' | 'delete' | 'view' = 'view'): boolean => {
    // Superusuarios pueden hacer todo
    if (isSuperuser) return true;
    
    // Usar la lógica del trial manager para usuarios normales
    return trialCanPerformAction(action);
  };

  // Obtener límites actuales
  const obtenerLimites = () => {
    if (isSuperuser || permissionState.isInTrial) {
      return {
        cartas_porte: null,
        conductores: null,
        vehiculos: null,
        socios: null,
      };
    }

    if (!suscripcion?.plan) return {
      cartas_porte: null,
      conductores: null,
      vehiculos: null,
      socios: null,
    };

    return {
      cartas_porte: suscripcion.plan.limite_cartas_porte,
      conductores: suscripcion.plan.limite_conductores,
      vehiculos: suscripcion.plan.limite_vehiculos,
      socios: suscripcion.plan.limite_socios,
    };
  };

  // Obtener uso actual
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

  return {
    // Estado principal
    isSuperuser,
    planActual: permissionState.planActual,
    estaBloqueado: permissionState.isBlocked,
    suscripcionVencida: permissionState.isExpired,
    hasFullAccess: permissionState.hasFullAccess,
    
    // Estados de trial
    isInActiveTrial: permissionState.isInTrial,
    isTrialExpired: permissionState.isExpired,
    isInGracePeriod: permissionState.isInGrace,
    
    // Funciones principales
    puedeCrear,
    puedeAcceder,
    canPerformAction,
    obtenerLimites,
    obtenerUsoActual,
    
    // Funciones específicas (para compatibilidad)
    puedeAccederAdministracion: () => puedeAcceder('administracion'),
    puedeAccederFuncionesAvanzadas: () => puedeAcceder('funciones_avanzadas'),
    puedeAccederEnterprise: () => puedeAcceder('enterprise'),
  };
};
