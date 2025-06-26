
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useSuscripcion } from './useSuscripcion';
import { useOptimizedSuperuser } from './useOptimizedSuperuser';
import { differenceInDays, parseISO } from 'date-fns';

// Tipos para el nuevo sistema unificado
export interface PermissionResultV2 {
  allowed: boolean;
  reason: string;
  limit?: number;
  used?: number;
}

export interface FreemiumLimits {
  vehiculos: number;
  remolques: number;
  socios: number;
  viajes_mensual: number;
  cartas_porte_mensual: number;
}

export interface UnifiedPermissionsV2 {
  // Estado global del usuario
  userId: string | null;
  isAuthenticated: boolean;
  
  // Nivel de acceso principal
  accessLevel: 'superuser' | 'trial' | 'paid' | 'freemium' | 'blocked' | 'expired' | 'none';
  accessReason: string;
  hasFullAccess: boolean;
  
  // Permisos específicos de creación (ahora todos permitidos, solo verifican límites)
  canCreateConductor: PermissionResultV2;
  canCreateVehiculo: PermissionResultV2;
  canCreateSocio: PermissionResultV2;
  canCreateCartaPorte: PermissionResultV2;
  canCreateRemolque: PermissionResultV2;
  canCreateViaje: PermissionResultV2;
  
  // Información del plan actual
  planInfo: {
    name: string;
    type: 'superuser' | 'trial' | 'paid' | 'freemium' | 'none';
    daysRemaining?: number;
    daysUsed?: number;
    totalTrialDays?: number;
    trialStartDate?: Date;
    trialEndDate?: Date;
    isActive: boolean;
    limits?: FreemiumLimits;
  };
  
  // Datos de uso (simplificados para debug)
  usage: {
    conductores: { used: number; limit: number | null };
    vehiculos: { used: number; limit: number | null };
    socios: { used: number; limit: number | null };
    cartas_porte: { used: number; limit: number | null };
    remolques: { used: number; limit: number | null };
    viajes: { used: number; limit: number | null };
  };
  
  // Métodos de compatibilidad
  canPerformAction: (action: string) => boolean;
  getPermissionForResource: (resource: string) => PermissionResultV2;
}

// Límites del plan Gratis (anteriormente Freemium)
const FREEMIUM_LIMITS: FreemiumLimits = {
  vehiculos: 3,
  remolques: 2,
  socios: 5,
  viajes_mensual: 5,
  cartas_porte_mensual: 5
};

/**
 * Hook Unificado de Permisos V2 - FUENTE ÚNICA DE VERDAD
 * 
 * Implementa las reglas de negocio fundamentales:
 * 1. Superusuario → Acceso total
 * 2. Trial activo → Acceso total
 * 3. Plan activo → Acceso total (sin límites de plan pagado)
 * 4. Sin plan o trial expirado → Plan Gratis con límites de cantidad únicamente
 * 5. Cuenta bloqueada → Sin acceso
 */
export const useUnifiedPermissionsV2 = (): UnifiedPermissionsV2 => {
  const { user } = useAuth();
  const { isSuperuser } = useOptimizedSuperuser();
  const { suscripcion, estaBloqueado } = useSuscripcion();

  return useMemo(() => {
    console.log('[UnifiedPermissionsV2] 🔄 Evaluando permisos...');
    
    // Verificar autenticación básica
    if (!user) {
      console.log('[UnifiedPermissionsV2] ❌ Usuario no autenticado');
      return createNoAccessPermissions('Usuario no autenticado');
    }

    console.log('[UnifiedPermissionsV2] ✅ Usuario autenticado:', user.id);

    // REGLA 1: SUPERUSUARIO - Acceso total e incondicional
    if (isSuperuser) {
      console.log('[UnifiedPermissionsV2] 👑 SUPERUSUARIO detectado - Acceso total');
      return createSuperuserPermissions(user.id);
    }

    // REGLA 2: CUENTA BLOQUEADA - Sin acceso
    if (estaBloqueado) {
      console.log('[UnifiedPermissionsV2] 🚫 CUENTA BLOQUEADA');
      return createBlockedPermissions(user.id);
    }

    // CALCULAR INFORMACIÓN DEL TRIAL - FUENTE ÚNICA DE VERDAD
    const trialInfo = calculateTrialInfo(user);
    console.log('[UnifiedPermissionsV2] 📊 Info del trial calculada:', trialInfo);

    // REGLA 3: TRIAL ACTIVO - Acceso total durante período de prueba
    if (trialInfo.isTrialActive && !trialInfo.isTrialExpired) {
      console.log('[UnifiedPermissionsV2] 🎯 TRIAL ACTIVO - Día', trialInfo.daysUsed, 'de', trialInfo.totalTrialDays);
      return createTrialPermissions(user.id, trialInfo);
    }

    // REGLA 4: PLAN ACTIVO - Acceso total sin límites
    if (suscripcion?.status === 'active' && suscripcion.plan) {
      console.log('[UnifiedPermissionsV2] 💳 PLAN ACTIVO:', suscripcion.plan.nombre);
      return createPaidPlanPermissions(user.id, suscripcion);
    }

    // REGLA 5: TRIAL EXPIRADO O SIN PLAN - Plan Gratis con límites de cantidad únicamente
    console.log('[UnifiedPermissionsV2] 🆓 TRANSICIÓN A PLAN GRATIS');
    return createFreemiumPermissions(user.id, trialInfo);

  }, [user, isSuperuser, suscripcion, estaBloqueado]);
};

// FUNCIÓN CENTRALIZADA PARA CALCULAR INFO DEL TRIAL - FUENTE ÚNICA DE VERDAD
function calculateTrialInfo(user: any) {
  const now = new Date();
  const TOTAL_TRIAL_DAYS = 14;
  
  // Usar created_at como fecha de inicio del trial
  const createdAt = user.created_at ? parseISO(user.created_at) : new Date();
  
  // Calcular fecha de finalización del trial
  const trialEndDate = new Date(createdAt);
  trialEndDate.setDate(trialEndDate.getDate() + TOTAL_TRIAL_DAYS);
  
  // Calcular días usados y restantes
  const daysUsed = Math.max(0, differenceInDays(now, createdAt));
  const daysRemaining = Math.max(0, differenceInDays(trialEndDate, now));
  const isTrialExpired = now > trialEndDate;
  const isTrialActive = !isTrialExpired;

  console.log('[TrialCalculation] 📅 Fechas:', {
    created: createdAt.toISOString(),
    now: now.toISOString(),
    trialEnd: trialEndDate.toISOString(),
    daysUsed,
    daysRemaining,
    isExpired: isTrialExpired
  });

  return {
    daysUsed,
    daysRemaining,
    totalTrialDays: TOTAL_TRIAL_DAYS,
    trialStartDate: createdAt,
    trialEndDate,
    isTrialExpired,
    isTrialActive
  };
}

// Funciones auxiliares para crear objetos de permisos

function createNoAccessPermissions(reason: string): UnifiedPermissionsV2 {
  const getPermissionForResource = (resource: string) => ({ allowed: false, reason });
  
  return {
    userId: null,
    isAuthenticated: false,
    accessLevel: 'none',
    accessReason: reason,
    hasFullAccess: false,
    canCreateConductor: { allowed: false, reason },
    canCreateVehiculo: { allowed: false, reason },
    canCreateSocio: { allowed: false, reason },
    canCreateCartaPorte: { allowed: false, reason },
    canCreateRemolque: { allowed: false, reason },
    canCreateViaje: { allowed: false, reason },
    planInfo: { name: 'Sin autenticación', type: 'none', isActive: false },
    usage: { 
      conductores: { used: 0, limit: 0 }, 
      vehiculos: { used: 0, limit: 0 }, 
      socios: { used: 0, limit: 0 }, 
      cartas_porte: { used: 0, limit: 0 },
      remolques: { used: 0, limit: 0 },
      viajes: { used: 0, limit: 0 }
    },
    canPerformAction: () => false,
    getPermissionForResource
  };
}

function createSuperuserPermissions(userId: string): UnifiedPermissionsV2 {
  const fullAccess = { allowed: true, reason: 'Acceso total como Superusuario' };
  const getPermissionForResource = () => fullAccess;
  
  return {
    userId,
    isAuthenticated: true,
    accessLevel: 'superuser',
    accessReason: 'Acceso total como Superusuario - Sin restricciones',
    hasFullAccess: true,
    canCreateConductor: fullAccess,
    canCreateVehiculo: fullAccess,
    canCreateSocio: fullAccess,
    canCreateCartaPorte: fullAccess,
    canCreateRemolque: fullAccess,
    canCreateViaje: fullAccess,
    planInfo: { name: 'Superusuario', type: 'superuser', isActive: true },
    usage: { 
      conductores: { used: 0, limit: null }, 
      vehiculos: { used: 0, limit: null }, 
      socios: { used: 0, limit: null }, 
      cartas_porte: { used: 0, limit: null },
      remolques: { used: 0, limit: null },
      viajes: { used: 0, limit: null }
    },
    canPerformAction: () => true,
    getPermissionForResource
  };
}

function createTrialPermissions(userId: string, trialInfo: any): UnifiedPermissionsV2 {
  const trialAccess = { allowed: true, reason: `Acceso total durante período de prueba (día ${trialInfo.daysUsed} de ${trialInfo.totalTrialDays})` };
  const getPermissionForResource = () => trialAccess;
  
  return {
    userId,
    isAuthenticated: true,
    accessLevel: 'trial',
    accessReason: `Día ${trialInfo.daysUsed} de ${trialInfo.totalTrialDays} de prueba gratuita`,
    hasFullAccess: true,
    canCreateConductor: trialAccess,
    canCreateVehiculo: trialAccess,
    canCreateSocio: trialAccess,
    canCreateCartaPorte: trialAccess,
    canCreateRemolque: trialAccess,
    canCreateViaje: trialAccess,
    planInfo: { 
      name: 'Período de Prueba Gratuita', 
      type: 'trial', 
      daysRemaining: trialInfo.daysRemaining,
      daysUsed: trialInfo.daysUsed,
      totalTrialDays: trialInfo.totalTrialDays,
      trialStartDate: trialInfo.trialStartDate,
      trialEndDate: trialInfo.trialEndDate,
      isActive: true 
    },
    usage: { 
      conductores: { used: 0, limit: null }, 
      vehiculos: { used: 0, limit: null }, 
      socios: { used: 0, limit: null }, 
      cartas_porte: { used: 0, limit: null },
      remolques: { used: 0, limit: null },
      viajes: { used: 0, limit: null }
    },
    canPerformAction: () => true,
    getPermissionForResource
  };
}

function createBlockedPermissions(userId: string): UnifiedPermissionsV2 {
  const blockedAccess = { allowed: false, reason: 'Cuenta bloqueada por falta de pago' };
  const getPermissionForResource = () => blockedAccess;
  
  return {
    userId,
    isAuthenticated: true,
    accessLevel: 'blocked',
    accessReason: 'Cuenta bloqueada por falta de pago',
    hasFullAccess: false,
    canCreateConductor: blockedAccess,
    canCreateVehiculo: blockedAccess,
    canCreateSocio: blockedAccess,
    canCreateCartaPorte: blockedAccess,
    canCreateRemolque: blockedAccess,
    canCreateViaje: blockedAccess,
    planInfo: { name: 'Cuenta Bloqueada', type: 'none', isActive: false },
    usage: { 
      conductores: { used: 0, limit: 0 }, 
      vehiculos: { used: 0, limit: 0 }, 
      socios: { used: 0, limit: 0 }, 
      cartas_porte: { used: 0, limit: 0 },
      remolques: { used: 0, limit: 0 },
      viajes: { used: 0, limit: 0 }
    },
    canPerformAction: () => false,
    getPermissionForResource
  };
}

function createPaidPlanPermissions(userId: string, suscripcion: any): UnifiedPermissionsV2 {
  const plan = suscripcion.plan;
  const fullAccess = { allowed: true, reason: `Acceso total con plan ${plan.nombre}` };
  
  const getPermissionForResource = () => fullAccess; // Planes pagados = acceso total sin límites
  
  return {
    userId,
    isAuthenticated: true,
    accessLevel: 'paid',
    accessReason: `Plan '${plan.nombre}' activo - Acceso total`,
    hasFullAccess: true,
    canCreateConductor: fullAccess,
    canCreateVehiculo: fullAccess,
    canCreateSocio: fullAccess,
    canCreateCartaPorte: fullAccess,
    canCreateRemolque: fullAccess,
    canCreateViaje: fullAccess,
    planInfo: { name: plan.nombre, type: 'paid', isActive: true },
    usage: { 
      conductores: { used: 0, limit: null }, 
      vehiculos: { used: 0, limit: null }, 
      socios: { used: 0, limit: null }, 
      cartas_porte: { used: 0, limit: null },
      remolques: { used: 0, limit: null },
      viajes: { used: 0, limit: null }
    },
    canPerformAction: () => true,
    getPermissionForResource
  };
}

// NUEVA FUNCIÓN: Permisos para Plan Gratis con límites específicos
function createFreemiumPermissions(userId: string, trialInfo: any): UnifiedPermissionsV2 {
  const getPermissionForResource = (resource: string) => {
    switch (resource) {
      case 'vehiculos': 
        return {
          allowed: true, // Permitir siempre, la validación será en el interceptor
          reason: `Plan Gratis - Máximo ${FREEMIUM_LIMITS.vehiculos} vehículos`,
          limit: FREEMIUM_LIMITS.vehiculos,
          used: 0 // Se actualizará con datos reales
        };
      case 'remolques': 
        return {
          allowed: true,
          reason: `Plan Gratis - Máximo ${FREEMIUM_LIMITS.remolques} remolques`,
          limit: FREEMIUM_LIMITS.remolques,
          used: 0
        };
      case 'socios': 
        return {
          allowed: true,
          reason: `Plan Gratis - Máximo ${FREEMIUM_LIMITS.socios} socios`,
          limit: FREEMIUM_LIMITS.socios,
          used: 0
        };
      case 'viajes': 
        return {
          allowed: true,
          reason: `Plan Gratis - Máximo ${FREEMIUM_LIMITS.viajes_mensual} viajes por mes`,
          limit: FREEMIUM_LIMITS.viajes_mensual,
          used: 0
        };
      case 'cartas_porte': 
        return {
          allowed: true,
          reason: `Plan Gratis - Máximo ${FREEMIUM_LIMITS.cartas_porte_mensual} cartas por mes`,
          limit: FREEMIUM_LIMITS.cartas_porte_mensual,
          used: 0
        };
      case 'conductores': 
        return {
          allowed: true,
          reason: 'Plan Gratis - Conductores sin límite',
        };
      default: 
        return { 
          allowed: true, // Cambio: ahora todo está permitido, solo con límites de cantidad
          reason: 'Acceso permitido en plan Gratis' 
        };
    }
  };
  
  return {
    userId,
    isAuthenticated: true,
    accessLevel: 'freemium',
    accessReason: 'Plan Gratis - Acceso con límites de cantidad únicamente',
    hasFullAccess: true, // Cambio: acceso a todas las funciones, solo límites de cantidad
    canCreateConductor: getPermissionForResource('conductores'),
    canCreateVehiculo: getPermissionForResource('vehiculos'),
    canCreateSocio: getPermissionForResource('socios'),
    canCreateCartaPorte: getPermissionForResource('cartas_porte'),
    canCreateRemolque: getPermissionForResource('remolques'),
    canCreateViaje: getPermissionForResource('viajes'),
    planInfo: { 
      name: 'Plan Gratis', // Cambio: de "Plan Freemium" a "Plan Gratis"
      type: 'freemium', 
      daysRemaining: 0,
      daysUsed: trialInfo.daysUsed,
      totalTrialDays: trialInfo.totalTrialDays,
      isActive: true,
      limits: FREEMIUM_LIMITS
    },
    usage: { 
      conductores: { used: 0, limit: null }, 
      vehiculos: { used: 0, limit: FREEMIUM_LIMITS.vehiculos }, 
      socios: { used: 0, limit: FREEMIUM_LIMITS.socios }, 
      cartas_porte: { used: 0, limit: FREEMIUM_LIMITS.cartas_porte_mensual },
      remolques: { used: 0, limit: FREEMIUM_LIMITS.remolques },
      viajes: { used: 0, limit: FREEMIUM_LIMITS.viajes_mensual }
    },
    canPerformAction: () => true, // Cambio: siempre permitir, solo validar límites de cantidad
    getPermissionForResource
  };
}
