
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useSuscripcion } from './useSuscripcion';
import { useOptimizedTrialTracking } from './useOptimizedTrialTracking';
import { useOptimizedSuperuser } from './useOptimizedSuperuser';
import { useConductores } from './useConductores';
import { useVehiculos } from './useVehiculos';
import { useSocios } from './useSocios';
import { useCartasPorte } from './useCartasPorte';
import { useStorageUsage } from './useStorageUsage';

// Tipos para el sistema unificado de permisos
export interface PermissionResult {
  allowed: boolean;
  reason: string;
  limit?: number;
  used?: number;
}

export interface UnifiedPermissions {
  // Estado global
  hasFullAccess: boolean;
  accessLevel: 'superuser' | 'trial' | 'paid' | 'blocked' | 'expired';
  accessReason: string;
  
  // Permisos específicos de creación
  canCreateConductor: PermissionResult;
  canCreateVehiculo: PermissionResult;
  canCreateSocio: PermissionResult;
  canCreateCartaPorte: PermissionResult;
  canUploadFile: PermissionResult;
  
  // Permisos de funcionalidades
  canTimbrar: PermissionResult;
  canGenerateXML: PermissionResult;
  canCancelCFDI: PermissionResult;
  canUseTracking: PermissionResult;
  canAccessAdmin: PermissionResult;
  canAccessAdvanced: PermissionResult;
  canAccessEnterprise: PermissionResult;
  
  // Información de uso
  usage: {
    conductores: { used: number; limit: number | null };
    vehiculos: { used: number; limit: number | null };
    socios: { used: number; limit: number | null };
    cartas_porte: { used: number; limit: number | null };
    almacenamiento: { used: number; limit: number | null; usedGB: number };
  };
  
  // Información del plan
  planInfo: {
    name: string;
    type: 'trial' | 'paid' | 'none';
    daysRemaining?: number;
    expiresAt?: Date;
  };

  // Propiedades de compatibilidad con el sistema anterior
  isSuperuser: boolean;
  planActual: string;
  estaBloqueado: boolean;
  suscripcionVencida: boolean;
  isTrialExpired: boolean;
  isInGracePeriod: boolean;
  
  // Métodos de compatibilidad
  puedeCrear: (resource: string) => { puede: boolean; razon?: string };
  puedeAcceder: (feature: string) => { puede: boolean; razon?: string };
  canPerformAction: (action: string) => boolean;
  obtenerUsoActual: () => any;
}

export const useUnifiedPermissions = (): UnifiedPermissions => {
  const { user } = useAuth();
  const { isSuperuser } = useOptimizedSuperuser();
  const { suscripcion, estaBloqueado } = useSuscripcion();
  const { trialInfo } = useOptimizedTrialTracking();
  const { gbUtilizados, archivosCount } = useStorageUsage();
  
  // Hooks para conteo de recursos
  const { conductores } = useConductores();
  const { vehiculos } = useVehiculos();
  const { socios } = useSocios();
  const { cartasPorte } = useCartasPorte();

  return useMemo(() => {
    console.log('[UnifiedPermissions] Estado actual:', {
      isSuperuser,
      userId: user?.id,
      estaBloqueado,
      trialInfo,
      suscripcion
    });

    // Cálculos comunes
    const conductoresUsed = conductores?.length || 0;
    const vehiculosUsed = vehiculos?.length || 0;
    const sociosUsed = socios?.length || 0;
    const cartasPorteUsed = cartasPorte?.length || 0;
    const almacenamientoUsedGB = gbUtilizados || 0;
    
    const isTrialExpiredCalc = trialInfo.isTrialExpired || false;
    const isInGracePeriodCalc = trialInfo.daysRemaining < -14 && trialInfo.daysRemaining > -30;
    const suscripcionVencidaCalc = suscripcion?.status === 'past_due' || suscripcion?.status === 'canceled';

    // REGLA 1: SUPERUSUARIO (Acceso Total e Incondicional)
    if (isSuperuser) {
      console.log('[UnifiedPermissions] ✅ SUPERUSUARIO DETECTADO - Acceso total');
      
      const basePermissions = {
        hasFullAccess: true,
        accessLevel: 'superuser' as const,
        accessReason: 'Acceso de Superusuario - Sin restricciones',
        
        canCreateConductor: { allowed: true, reason: 'Superusuario' },
        canCreateVehiculo: { allowed: true, reason: 'Superusuario' },
        canCreateSocio: { allowed: true, reason: 'Superusuario' },
        canCreateCartaPorte: { allowed: true, reason: 'Superusuario' },
        canUploadFile: { allowed: true, reason: 'Superusuario' },
        
        canTimbrar: { allowed: true, reason: 'Superusuario' },
        canGenerateXML: { allowed: true, reason: 'Superusuario' },
        canCancelCFDI: { allowed: true, reason: 'Superusuario' },
        canUseTracking: { allowed: true, reason: 'Superusuario' },
        canAccessAdmin: { allowed: true, reason: 'Superusuario' },
        canAccessAdvanced: { allowed: true, reason: 'Superusuario' },
        canAccessEnterprise: { allowed: true, reason: 'Superusuario' },
        
        usage: {
          conductores: { used: conductoresUsed, limit: null },
          vehiculos: { used: vehiculosUsed, limit: null },
          socios: { used: sociosUsed, limit: null },
          cartas_porte: { used: cartasPorteUsed, limit: null },
          almacenamiento: { used: archivosCount, limit: null, usedGB: almacenamientoUsedGB },
        },
        
        planInfo: {
          name: 'Acceso de Superusuario',
          type: 'paid' as const
        },

        // Compatibilidad
        isSuperuser: true,
        planActual: 'Superusuario',
        estaBloqueado: false,
        suscripcionVencida: false,
        isTrialExpired: false,
        isInGracePeriod: false,
      };

      return {
        ...basePermissions,
        puedeCrear: () => ({ puede: true, razon: 'Superusuario' }),
        puedeAcceder: () => ({ puede: true, razon: 'Superusuario' }),
        canPerformAction: () => true,
        obtenerUsoActual: () => basePermissions.usage
      };
    }

    // REGLA 2: PERIODO DE PRUEBA (14 Días)
    if (trialInfo.isTrialActive && !isTrialExpiredCalc) {
      console.log('[UnifiedPermissions] ✅ TRIAL ACTIVO');
      
      const basePermissions = {
        hasFullAccess: true,
        accessLevel: 'trial' as const,
        accessReason: `Día ${trialInfo.daysUsed} de ${trialInfo.totalTrialDays} de prueba gratuita`,
        
        canCreateConductor: { allowed: true, reason: 'Período de prueba activo' },
        canCreateVehiculo: { allowed: true, reason: 'Período de prueba activo' },
        canCreateSocio: { allowed: true, reason: 'Período de prueba activo' },
        canCreateCartaPorte: { allowed: true, reason: 'Período de prueba activo' },
        canUploadFile: { allowed: true, reason: 'Período de prueba activo' },
        
        canTimbrar: { allowed: true, reason: 'Período de prueba activo' },
        canGenerateXML: { allowed: true, reason: 'Período de prueba activo' },
        canCancelCFDI: { allowed: true, reason: 'Período de prueba activo' },
        canUseTracking: { allowed: true, reason: 'Período de prueba activo' },
        canAccessAdmin: { allowed: true, reason: 'Período de prueba activo' },
        canAccessAdvanced: { allowed: true, reason: 'Período de prueba activo' },
        canAccessEnterprise: { allowed: false, reason: 'Funciones Enterprise requieren plan pagado' },
        
        usage: {
          conductores: { used: conductoresUsed, limit: null },
          vehiculos: { used: vehiculosUsed, limit: null },
          socios: { used: sociosUsed, limit: null },
          cartas_porte: { used: cartasPorteUsed, limit: null },
          almacenamiento: { used: archivosCount, limit: null, usedGB: almacenamientoUsedGB },
        },
        
        planInfo: {
          name: 'Período de Prueba Gratuita',
          type: 'trial' as const,
          daysRemaining: trialInfo.daysRemaining,
          expiresAt: trialInfo.trialEndDate || undefined
        },

        // Compatibilidad
        isSuperuser: false,
        planActual: 'Trial',
        estaBloqueado: false,
        suscripcionVencida: false,
        isTrialExpired: false,
        isInGracePeriod: false,
      };

      return {
        ...basePermissions,
        puedeCrear: () => ({ puede: true, razon: 'Período de prueba activo' }),
        puedeAcceder: () => ({ puede: true, razon: 'Período de prueba activo' }),
        canPerformAction: () => true,
        obtenerUsoActual: () => basePermissions.usage
      };
    }

    // REGLA 3: CUENTA BLOQUEADA
    if (estaBloqueado) {
      console.log('[UnifiedPermissions] ❌ CUENTA BLOQUEADA');
      
      const basePermissions = {
        hasFullAccess: false,
        accessLevel: 'blocked' as const,
        accessReason: 'Cuenta bloqueada por falta de pago',
        
        canCreateConductor: { allowed: false, reason: 'Cuenta bloqueada' },
        canCreateVehiculo: { allowed: false, reason: 'Cuenta bloqueada' },
        canCreateSocio: { allowed: false, reason: 'Cuenta bloqueada' },
        canCreateCartaPorte: { allowed: false, reason: 'Cuenta bloqueada' },
        canUploadFile: { allowed: false, reason: 'Cuenta bloqueada' },
        
        canTimbrar: { allowed: false, reason: 'Cuenta bloqueada' },
        canGenerateXML: { allowed: false, reason: 'Cuenta bloqueada' },
        canCancelCFDI: { allowed: false, reason: 'Cuenta bloqueada' },
        canUseTracking: { allowed: false, reason: 'Cuenta bloqueada' },
        canAccessAdmin: { allowed: false, reason: 'Cuenta bloqueada' },
        canAccessAdvanced: { allowed: false, reason: 'Cuenta bloqueada' },
        canAccessEnterprise: { allowed: false, reason: 'Cuenta bloqueada' },
        
        usage: {
          conductores: { used: conductoresUsed, limit: 0 },
          vehiculos: { used: vehiculosUsed, limit: 0 },
          socios: { used: sociosUsed, limit: 0 },
          cartas_porte: { used: cartasPorteUsed, limit: 0 },
          almacenamiento: { used: archivosCount, limit: 0, usedGB: almacenamientoUsedGB },
        },
        
        planInfo: {
          name: 'Cuenta Bloqueada',
          type: 'none' as const
        },

        // Compatibilidad
        isSuperuser: false,
        planActual: 'Bloqueado',
        estaBloqueado: true,
        suscripcionVencida: suscripcionVencidaCalc,
        isTrialExpired: isTrialExpiredCalc,
        isInGracePeriod: isInGracePeriodCalc,
      };

      return {
        ...basePermissions,
        puedeCrear: () => ({ puede: false, razon: 'Cuenta bloqueada' }),
        puedeAcceder: () => ({ puede: false, razon: 'Cuenta bloqueada' }),
        canPerformAction: () => false,
        obtenerUsoActual: () => basePermissions.usage
      };
    }

    // REGLA 4: SUSCRIPCIÓN ACTIVA Y LÍMITES
    if (suscripcion?.status === 'active' && suscripcion.plan) {
      console.log('[UnifiedPermissions] ✅ PLAN PAGADO ACTIVO:', suscripcion.plan.nombre);
      
      const plan = suscripcion.plan;
      
      const basePermissions = {
        hasFullAccess: false,
        accessLevel: 'paid' as const,
        accessReason: `Plan '${plan.nombre}' activo`,
        
        canCreateConductor: {
          allowed: plan.limite_conductores ? conductoresUsed < plan.limite_conductores : true,
          reason: plan.limite_conductores ? 
            `${conductoresUsed}/${plan.limite_conductores} conductores usados` : 
            'Sin límite de conductores',
          limit: plan.limite_conductores || undefined,
          used: conductoresUsed
        },
        
        canCreateVehiculo: {
          allowed: plan.limite_vehiculos ? vehiculosUsed < plan.limite_vehiculos : true,
          reason: plan.limite_vehiculos ? 
            `${vehiculosUsed}/${plan.limite_vehiculos} vehículos usados` : 
            'Sin límite de vehículos',
          limit: plan.limite_vehiculos || undefined,
          used: vehiculosUsed
        },
        
        canCreateSocio: {
          allowed: plan.limite_socios ? sociosUsed < plan.limite_socios : true,
          reason: plan.limite_socios ? 
            `${sociosUsed}/${plan.limite_socios} socios usados` : 
            'Sin límite de socios',
          limit: plan.limite_socios || undefined,
          used: sociosUsed
        },
        
        canCreateCartaPorte: {
          allowed: plan.limite_cartas_porte ? cartasPorteUsed < plan.limite_cartas_porte : true,
          reason: plan.limite_cartas_porte ? 
            `${cartasPorteUsed}/${plan.limite_cartas_porte} cartas de porte usadas` : 
            'Sin límite de cartas de porte',
          limit: plan.limite_cartas_porte || undefined,
          used: cartasPorteUsed
        },
        
        canUploadFile: {
          allowed: true,
          reason: 'Permitido en plan actual'
        },
        
        canTimbrar: { 
          allowed: !!plan.puede_timbrar, 
          reason: plan.puede_timbrar ? 'Incluido en su plan' : 'No incluido en su plan actual' 
        },
        canGenerateXML: { 
          allowed: !!plan.puede_generar_xml, 
          reason: plan.puede_generar_xml ? 'Incluido en su plan' : 'No incluido en su plan actual' 
        },
        canCancelCFDI: { 
          allowed: !!plan.puede_cancelar_cfdi, 
          reason: plan.puede_cancelar_cfdi ? 'Incluido en su plan' : 'No incluido en su plan actual' 
        },
        canUseTracking: { 
          allowed: !!plan.puede_tracking, 
          reason: plan.puede_tracking ? 'Incluido en su plan' : 'No incluido en su plan actual' 
        },
        canAccessAdmin: { 
          allowed: !!plan.puede_acceder_administracion, 
          reason: plan.puede_acceder_administracion ? 'Incluido en su plan' : 'Disponible desde Plan Gestión IA' 
        },
        canAccessAdvanced: { 
          allowed: !!plan.puede_acceder_funciones_avanzadas, 
          reason: plan.puede_acceder_funciones_avanzadas ? 'Incluido en su plan' : 'Disponible desde Plan Automatización Total' 
        },
        canAccessEnterprise: { 
          allowed: !!plan.puede_acceder_enterprise, 
          reason: plan.puede_acceder_enterprise ? 'Incluido en su plan' : 'Disponible solo en Plan Enterprise' 
        },
        
        usage: {
          conductores: { used: conductoresUsed, limit: plan.limite_conductores },
          vehiculos: { used: vehiculosUsed, limit: plan.limite_vehiculos },
          socios: { used: sociosUsed, limit: plan.limite_socios },
          cartas_porte: { used: cartasPorteUsed, limit: plan.limite_cartas_porte },
          almacenamiento: { 
            used: archivosCount, 
            limit: null,
            usedGB: almacenamientoUsedGB 
          },
        },
        
        planInfo: {
          name: plan.nombre,
          type: 'paid' as const,
          expiresAt: suscripcion.fecha_vencimiento ? new Date(suscripcion.fecha_vencimiento) : undefined
        },

        // Compatibilidad
        isSuperuser: false,
        planActual: plan.nombre,
        estaBloqueado: false,
        suscripcionVencida: suscripcionVencidaCalc,
        isTrialExpired: isTrialExpiredCalc,
        isInGracePeriod: isInGracePeriodCalc,
      };

      return {
        ...basePermissions,
        puedeCrear: (resource: string) => {
          const resourceMap = {
            conductores: basePermissions.canCreateConductor,
            vehiculos: basePermissions.canCreateVehiculo,
            socios: basePermissions.canCreateSocio,
            cartas_porte: basePermissions.canCreateCartaPorte,
            archivos: basePermissions.canUploadFile,
          };
          const permission = resourceMap[resource as keyof typeof resourceMap];
          return permission ? { puede: permission.allowed, razon: permission.reason } : { puede: false, razon: 'Recurso no encontrado' };
        },
        puedeAcceder: (feature: string) => {
          const featureMap = {
            timbrar: basePermissions.canTimbrar,
            generar_xml: basePermissions.canGenerateXML,
            cancelar_cfdi: basePermissions.canCancelCFDI,
            tracking: basePermissions.canUseTracking,
            administracion: basePermissions.canAccessAdmin,
            advanced: basePermissions.canAccessAdvanced,
            enterprise: basePermissions.canAccessEnterprise,
          };
          const permission = featureMap[feature as keyof typeof featureMap];
          return permission ? { puede: permission.allowed, razon: permission.reason } : { puede: false, razon: 'Funcionalidad no encontrada' };
        },
        canPerformAction: (action: string) => {
          if (action === 'create') return true;
          return false;
        },
        obtenerUsoActual: () => basePermissions.usage
      };
    }

    // REGLA 5: TRIAL EXPIRADO O PERÍODO DE GRACIA
    console.log('[UnifiedPermissions] ❌ ACCESO EXPIRADO');
    
    const basePermissions = {
      hasFullAccess: false,
      accessLevel: 'expired' as const,
      accessReason: isInGracePeriodCalc ? 
        'Período de gracia - Solo lectura' : 
        'Período de prueba finalizado',
      
      canCreateConductor: { allowed: false, reason: 'Período de prueba finalizado' },
      canCreateVehiculo: { allowed: false, reason: 'Período de prueba finalizado' },
      canCreateSocio: { allowed: false, reason: 'Período de prueba finalizado' },
      canCreateCartaPorte: { allowed: false, reason: 'Período de prueba finalizado' },
      canUploadFile: { allowed: false, reason: 'Período de prueba finalizado' },
      
      canTimbrar: { allowed: false, reason: 'Período de prueba finalizado' },
      canGenerateXML: { allowed: false, reason: 'Período de prueba finalizado' },
      canCancelCFDI: { allowed: false, reason: 'Período de prueba finalizado' },
      canUseTracking: { allowed: false, reason: 'Período de prueba finalizado' },
      canAccessAdmin: { allowed: false, reason: 'Período de prueba finalizado' },
      canAccessAdvanced: { allowed: false, reason: 'Período de prueba finalizado' },
      canAccessEnterprise: { allowed: false, reason: 'Período de prueba finalizado' },
      
      usage: {
        conductores: { used: conductoresUsed, limit: 0 },
        vehiculos: { used: vehiculosUsed, limit: 0 },
        socios: { used: sociosUsed, limit: 0 },
        cartas_porte: { used: cartasPorteUsed, limit: 0 },
        almacenamiento: { used: archivosCount, limit: 0, usedGB: almacenamientoUsedGB },
      },
      
      planInfo: {
        name: isInGracePeriodCalc ? 'Período de Gracia' : 'Trial Expirado',
        type: 'none' as const
      },

      // Compatibilidad
      isSuperuser: false,
      planActual: 'Expirado',
      estaBloqueado: false,
      suscripcionVencida: suscripcionVencidaCalc,
      isTrialExpired: isTrialExpiredCalc,
      isInGracePeriod: isInGracePeriodCalc,
    };

    return {
      ...basePermissions,
      puedeCrear: () => ({ puede: false, razon: 'Período de prueba finalizado' }),
      puedeAcceder: () => ({ puede: false, razon: 'Período de prueba finalizado' }),
      canPerformAction: () => false,
      obtenerUsoActual: () => basePermissions.usage
    };
  }, [
    isSuperuser,
    suscripcion,
    trialInfo,
    estaBloqueado,
    conductores,
    vehiculos,
    socios,
    cartasPorte,
    gbUtilizados,
    archivosCount,
    user?.id
  ]);
};
