
import { useMemo } from 'react';
import { useSuscripcion } from './useSuscripcion';
import { useSuperuser } from './useSuperuser';
import { useAuth } from './useAuth';
import { useConductores } from './useConductores';
import { useVehiculos } from './useVehiculos';
import { useSocios } from './useSocios';
import { useCartasPorte } from './useCartasPorte';
import { ResourceType, FunctionalityType, PermissionResult, Limits, UsageData } from '@/types/permissions';

export const useUnifiedPermissions = () => {
  const { user } = useAuth();
  const { isSuperuser } = useSuperuser();
  const { 
    suscripcion, 
    estaBloqueado, 
    suscripcionVencida,
    tienePermiso,
    verificarLimite,
    enPeriodoPrueba,
    enPeriodoGracia,
    diasRestantesPrueba,
    diasRestantesGracia
  } = useSuscripcion();
  
  const { conductores } = useConductores();
  const { vehiculos } = useVehiculos();
  const { socios } = useSocios();
  const { cartasPorte } = useCartasPorte();

  return useMemo(() => {
    console.log('useUnifiedPermissions: Computing permissions for user', {
      userId: user?.id,
      isSuperuser,
      subscriptionStatus: suscripcion?.status,
      isBlocked: estaBloqueado
    });

    // SUPERUSUARIOS: Acceso total sin restricciones
    if (isSuperuser) {
      console.log('useUnifiedPermissions: Superuser detected - granting full access');
      return {
        // Estados básicos
        isSuperuser: true,
        estaBloqueado: false,
        suscripcionVencida: false,
        planActual: 'Enterprise Sin Límites (Superuser)',
        
        // Estados de trial y gracia
        isInActiveTrial: false,
        isTrialExpired: false,
        isInGracePeriod: false,
        hasFullAccess: true,
        daysRemaining: 0,
        graceDaysRemaining: 0,
        gracePeriodDaysLeft: 0,
        dataWillBeDeleted: false,
        
        // Funciones de permisos
        puedeAcceder: () => ({ puede: true, razon: undefined }),
        puedeCrear: () => ({ puede: true, razon: undefined }),
        puedeAccederAdministracion: () => ({ puede: true, razon: undefined }),
        puedeAccederFuncionesAvanzadas: () => ({ puede: true, razon: undefined }),
        puedeAccederEnterprise: () => ({ puede: true, razon: undefined }),
        canPerformAction: () => true,
        
        // Límites y uso
        obtenerLimites: (): Limits => ({
          cartas_porte: null,
          conductores: null,
          vehiculos: null,
          socios: null,
        }),
        obtenerUsoActual: (): UsageData => ({
          cartas_porte: { usado: cartasPorte?.length || 0, limite: null },
          conductores: { usado: conductores?.length || 0, limite: null },
          vehiculos: { usado: vehiculos?.length || 0, limite: null },
          socios: { usado: socios?.length || 0, limite: null },
        })
      };
    }

    // USUARIOS NORMALES: Aplicar lógica de suscripción
    console.log('useUnifiedPermissions: Regular user - applying subscription logic');
    
    if (!user || !suscripcion) {
      console.log('useUnifiedPermissions: No user or subscription found');
      return {
        isSuperuser: false,
        estaBloqueado: false,
        suscripcionVencida: true,
        planActual: 'Sin Plan',
        isInActiveTrial: false,
        isTrialExpired: true,
        isInGracePeriod: false,
        hasFullAccess: false,
        daysRemaining: 0,
        graceDaysRemaining: 0,
        gracePeriodDaysLeft: 0,
        dataWillBeDeleted: false,
        puedeAcceder: () => ({ puede: false, razon: 'No hay suscripción activa' }),
        puedeCrear: () => ({ puede: false, razon: 'No hay suscripción activa' }),
        puedeAccederAdministracion: () => ({ puede: false, razon: 'No hay suscripción activa' }),
        puedeAccederFuncionesAvanzadas: () => ({ puede: false, razon: 'No hay suscripción activa' }),
        puedeAccederEnterprise: () => ({ puede: false, razon: 'No hay suscripción activa' }),
        canPerformAction: () => false,
        obtenerLimites: (): Limits => ({
          cartas_porte: null,
          conductores: null,
          vehiculos: null,
          socios: null,
        }),
        obtenerUsoActual: (): UsageData => ({
          cartas_porte: { usado: 0, limite: null },
          conductores: { usado: 0, limite: null },
          vehiculos: { usado: 0, limite: null },
          socios: { usado: 0, limite: null },
        })
      };
    }

    // Calcular estados de trial y gracia
    const now = new Date();
    const trialEndDate = suscripcion.fecha_fin_prueba ? new Date(suscripcion.fecha_fin_prueba) : null;
    const gracePeriodEnd = suscripcion.grace_period_end ? new Date(suscripcion.grace_period_end) : null;
    
    const isInActiveTrial = suscripcion.status === 'trial' && trialEndDate && trialEndDate > now;
    const isTrialExpired = suscripcion.status === 'trial' && trialEndDate && trialEndDate <= now;
    const isInGracePeriod = suscripcion.status === 'grace_period' && gracePeriodEnd && gracePeriodEnd > now;
    const hasFullAccess = isInActiveTrial || suscripcion.status === 'active';
    
    const daysRemaining = isInActiveTrial ? diasRestantesPrueba() : 0;
    const graceDaysRemaining = isInGracePeriod ? diasRestantesGracia() : 0;
    const gracePeriodDaysLeft = Math.max(0, Math.ceil((gracePeriodEnd ? gracePeriodEnd.getTime() - now.getTime() : 0) / (1000 * 60 * 60 * 24)));
    const dataWillBeDeleted = isInGracePeriod && graceDaysRemaining <= 3;

    // Determinar plan actual
    const getPlanActual = (): string => {
      if (isInActiveTrial) return 'Trial Completo (14 días)';
      if (isInGracePeriod) return 'Período de Gracia (Solo Lectura)';
      if (isTrialExpired && !suscripcion?.plan) return 'Sin Plan';
      return suscripcion?.plan?.nombre || 'Sin plan';
    };

    // Función para verificar acceso a funcionalidades
    const puedeAcceder = (funcionalidad: FunctionalityType): PermissionResult => {
      if (isInActiveTrial) return { puede: true };
      if (isInGracePeriod) return { puede: false, razon: 'Durante el período de gracia solo puede ver datos. Adquiera un plan para recuperar todas las funciones.' };
      if (estaBloqueado) return { puede: false, razon: 'Su cuenta está bloqueada por falta de pago' };
      if (suscripcionVencida() || isTrialExpired) return { puede: false, razon: 'Su período de prueba ha vencido o suscripción expirada' };

      // Lógica específica por funcionalidad
      switch (funcionalidad) {
        case 'cancelar_cfdi':
          return { puede: tienePermiso('puede_cancelar_cfdi'), razon: !tienePermiso('puede_cancelar_cfdi') ? 'Esta función no está disponible en su plan actual' : undefined };
        case 'generar_xml':
          return { puede: tienePermiso('puede_generar_xml'), razon: !tienePermiso('puede_generar_xml') ? 'Esta función no está disponible en su plan actual' : undefined };
        case 'timbrar':
          return { puede: tienePermiso('puede_timbrar'), razon: !tienePermiso('puede_timbrar') ? 'Esta función no está disponible en su plan actual' : undefined };
        case 'tracking':
          return { puede: tienePermiso('puede_tracking'), razon: !tienePermiso('puede_tracking') ? 'Esta función no está disponible en su plan actual' : undefined };
        case 'administracion':
          return { puede: tienePermiso('puede_acceder_administracion'), razon: !tienePermiso('puede_acceder_administracion') ? 'Módulo de administración disponible desde Plan Gestión IA' : undefined };
        case 'funciones_avanzadas':
          return { puede: tienePermiso('puede_acceder_funciones_avanzadas'), razon: !tienePermiso('puede_acceder_funciones_avanzadas') ? 'Funciones avanzadas disponibles desde Plan Automatización Total' : undefined };
        case 'enterprise':
          return { puede: tienePermiso('puede_acceder_enterprise'), razon: !tienePermiso('puede_acceder_enterprise') ? 'Funciones enterprise disponibles solo en Plan Enterprise Sin Límites' : undefined };
        default:
          return { puede: true };
      }
    };

    // Función para verificar creación de recursos
    const puedeCrear = (tipo: ResourceType): PermissionResult => {
      if (isInActiveTrial) return { puede: true };
      if (isInGracePeriod) return { puede: false, razon: 'Durante el período de gracia no puede crear nuevos registros. Adquiera un plan para recuperar todas las funciones.' };
      if (estaBloqueado) return { puede: false, razon: 'Su cuenta está bloqueada por falta de pago' };
      if (isTrialExpired && !suscripcion?.plan) return { puede: false, razon: 'Su período de prueba ha vencido. Actualice su plan para continuar creando registros.' };

      // Verificar límites
      let cantidad = 0;
      switch (tipo) {
        case 'conductores': cantidad = conductores?.length || 0; break;
        case 'vehiculos': cantidad = vehiculos?.length || 0; break;
        case 'socios': cantidad = socios?.length || 0; break;
        case 'cartas_porte': cantidad = cartasPorte?.length || 0; break;
      }

      if (!suscripcion?.plan) return { puede: true }; // Fallback

      const puedeCrearPorLimite = verificarLimite(tipo, cantidad);
      if (!puedeCrearPorLimite) {
        const limite = suscripcion?.plan?.[`limite_${tipo}`];
        return { puede: false, razon: `Ha alcanzado el límite de ${limite} ${tipo.replace('_', ' ')} para su plan actual` };
      }

      return { puede: true };
    };

    // Función para verificar acciones
    const canPerformAction = (action: 'create' | 'edit' | 'delete' | 'view' = 'view'): boolean => {
      if (isInGracePeriod && action !== 'view') return false;
      if (estaBloqueado) return false;
      return hasFullAccess;
    };

    // Obtener límites
    const obtenerLimites = (): Limits => {
      if (isInActiveTrial) {
        return { cartas_porte: null, conductores: null, vehiculos: null, socios: null };
      }
      if (!suscripcion?.plan) {
        return { cartas_porte: null, conductores: null, vehiculos: null, socios: null };
      }
      return {
        cartas_porte: suscripcion.plan.limite_cartas_porte,
        conductores: suscripcion.plan.limite_conductores,
        vehiculos: suscripcion.plan.limite_vehiculos,
        socios: suscripcion.plan.limite_socios,
      };
    };

    // Obtener uso actual
    const obtenerUsoActual = (): UsageData => {
      const limites = obtenerLimites();
      return {
        cartas_porte: { usado: cartasPorte?.length || 0, limite: limites.cartas_porte || null },
        conductores: { usado: conductores?.length || 0, limite: limites.conductores || null },
        vehiculos: { usado: vehiculos?.length || 0, limite: limites.vehiculos || null },
        socios: { usado: socios?.length || 0, limite: limites.socios || null },
      };
    };

    console.log('useUnifiedPermissions: Final permissions computed', {
      planActual: getPlanActual(),
      hasFullAccess,
      isInActiveTrial,
      isInGracePeriod,
      isTrialExpired
    });

    return {
      // Estados básicos
      isSuperuser: false,
      estaBloqueado,
      suscripcionVencida: suscripcionVencida() || (isTrialExpired && !isInGracePeriod),
      planActual: getPlanActual(),
      
      // Estados de trial y gracia
      isInActiveTrial,
      isTrialExpired,
      isInGracePeriod,
      hasFullAccess,
      daysRemaining,
      graceDaysRemaining,
      gracePeriodDaysLeft,
      dataWillBeDeleted,
      
      // Funciones de permisos
      puedeAcceder,
      puedeCrear,
      puedeAccederAdministracion: () => puedeAcceder('administracion'),
      puedeAccederFuncionesAvanzadas: () => puedeAcceder('funciones_avanzadas'),
      puedeAccederEnterprise: () => puedeAcceder('enterprise'),
      canPerformAction,
      
      // Límites y uso
      obtenerLimites,
      obtenerUsoActual
    };
  }, [
    user,
    isSuperuser,
    suscripcion,
    estaBloqueado,
    suscripcionVencida,
    tienePermiso,
    verificarLimite,
    enPeriodoPrueba,
    enPeriodoGracia,
    diasRestantesPrueba,
    diasRestantesGracia,
    conductores,
    vehiculos,
    socios,
    cartasPorte
  ]);
};
