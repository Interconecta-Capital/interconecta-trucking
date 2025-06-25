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

export interface UnifiedPermissionsV2 {
  // Estado global del usuario
  userId: string | null;
  isAuthenticated: boolean;
  
  // Nivel de acceso principal
  accessLevel: 'superuser' | 'trial' | 'paid' | 'blocked' | 'expired' | 'none';
  accessReason: string;
  hasFullAccess: boolean;
  
  // Permisos específicos de creación
  canCreateConductor: PermissionResultV2;
  canCreateVehiculo: PermissionResultV2;
  canCreateSocio: PermissionResultV2;
  canCreateCartaPorte: PermissionResultV2;
  canCreateRemolque: PermissionResultV2;
  
  // Información del plan actual
  planInfo: {
    name: string;
    type: 'superuser' | 'trial' | 'paid' | 'none';
    daysRemaining?: number;
    daysUsed?: number;
    totalTrialDays?: number;
    trialStartDate?: Date;
    trialEndDate?: Date;
    isActive: boolean;
  };
  
  // Datos de uso (simplificados para debug)
  usage: {
    conductores: { used: number; limit: number | null };
    vehiculos: { used: number; limit: number | null };
    socios: { used: number; limit: number | null };
    cartas_porte: { used: number; limit: number | null };
  };
  
  // Métodos de compatibilidad
  canPerformAction: (action: string) => boolean;
  getPermissionForResource: (resource: string) => PermissionResultV2;
}

/**
 * Hook Unificado de Permisos V2 - FUENTE ÚNICA DE VERDAD
 * 
 * Implementa las 5 reglas de negocio fundamentales:
 * 1. Superusuario → Acceso total
 * 2. Trial activo → Acceso total
 * 3. Plan activo → Aplicar límites
 * 4. Trial expirado SIN plan → BLOQUEADO TOTAL
 * 5. Sin plan → Sin acceso
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

    // CALCULAR INFORMACIÓN DEL TRIAL - FUENTE ÚNICA DE VERDAD
    const trialInfo = calculateTrialInfo(user);
    console.log('[UnifiedPermissionsV2] 📊 Info del trial calculada:', trialInfo);

    // NUEVA LÓGICA CRÍTICA: Verificar si hay plan activo ANTES de evaluar trial
    const hasActivePlan = suscripcion?.status === 'active' && suscripcion.plan;
    console.log('[UnifiedPermissionsV2] 💳 Plan activo:', hasActivePlan);

    // REGLA 2: TRIAL ACTIVO (solo si NO hay plan activo) - Acceso total durante período de prueba
    if (!hasActivePlan && trialInfo.isTrialActive && !trialInfo.isTrialExpired) {
      console.log('[UnifiedPermissionsV2] 🎯 TRIAL ACTIVO - Día', trialInfo.daysUsed, 'de', trialInfo.totalTrialDays);
      return createTrialPermissions(user.id, trialInfo);
    }

    // REGLA 3: CUENTA BLOQUEADA - Sin acceso
    if (estaBloqueado) {
      console.log('[UnifiedPermissionsV2] 🚫 CUENTA BLOQUEADA');
      return createBlockedPermissions(user.id);
    }

    // REGLA 4: PLAN ACTIVO - Aplicar límites
    if (hasActivePlan) {
      console.log('[UnifiedPermissionsV2] 💳 PLAN ACTIVO:', suscripcion.plan.nombre);
      return createPaidPlanPermissions(user.id, suscripcion);
    }

    // REGLA 5 CRÍTICA: TRIAL EXPIRADO Y SIN PLAN - BLOQUEADO TOTAL
    if (trialInfo.isTrialExpired && !hasActivePlan) {
      console.log('[UnifiedPermissionsV2] ⚠️ TRIAL EXPIRADO SIN PLAN - BLOQUEANDO USUARIO');
      console.log('[UnifiedPermissionsV2] 📅 Días restantes:', trialInfo.daysRemaining);
      return createTrialExpiredPermissions(user.id, trialInfo);
    }

    // FALLBACK: Sin acceso por defecto
    console.log('[UnifiedPermissionsV2] ❌ FALLBACK - Sin acceso');
    return createExpiredPermissions(user.id, trialInfo);

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
  
  // LÓGICA CRÍTICA CORREGIDA: Trial expira cuando daysRemaining <= 0
  const isTrialExpired = daysRemaining <= 0;
  const isTrialActive = !isTrialExpired;

  console.log('[TrialCalculation] 📅 Fechas críticas:', {
    created: createdAt.toISOString(),
    now: now.toISOString(),
    trialEnd: trialEndDate.toISOString(),
    daysUsed,
    daysRemaining,
    isExpired: isTrialExpired,
    isActive: isTrialActive
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
    planInfo: { name: 'Sin autenticación', type: 'none', isActive: false },
    usage: { conductores: { used: 0, limit: 0 }, vehiculos: { used: 0, limit: 0 }, socios: { used: 0, limit: 0 }, cartas_porte: { used: 0, limit: 0 } },
    canPerformAction: () => false,
    getPermissionForResource
  };
}

function createSuperuserPermissions(userId: string): UnifiedPermissionsV2 {
  const fullAccess = { allowed: true, reason: 'Acceso de Superusuario' };
  const getPermissionForResource = () => fullAccess;
  
  return {
    userId,
    isAuthenticated: true,
    accessLevel: 'superuser',
    accessReason: 'Acceso de Superusuario - Sin restricciones',
    hasFullAccess: true,
    canCreateConductor: fullAccess,
    canCreateVehiculo: fullAccess,
    canCreateSocio: fullAccess,
    canCreateCartaPorte: fullAccess,
    canCreateRemolque: fullAccess,
    planInfo: { name: 'Superusuario', type: 'superuser', isActive: true },
    usage: { conductores: { used: 0, limit: null }, vehiculos: { used: 0, limit: null }, socios: { used: 0, limit: null }, cartas_porte: { used: 0, limit: null } },
    canPerformAction: () => true,
    getPermissionForResource
  };
}

function createTrialPermissions(userId: string, trialInfo: any): UnifiedPermissionsV2 {
  const trialAccess = { allowed: true, reason: `Período de prueba activo (día ${trialInfo.daysUsed} de ${trialInfo.totalTrialDays})` };
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
    usage: { conductores: { used: 0, limit: null }, vehiculos: { used: 0, limit: null }, socios: { used: 0, limit: null }, cartas_porte: { used: 0, limit: null } },
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
    planInfo: { name: 'Cuenta Bloqueada', type: 'none', isActive: false },
    usage: { conductores: { used: 0, limit: 0 }, vehiculos: { used: 0, limit: 0 }, socios: { used: 0, limit: 0 }, cartas_porte: { used: 0, limit: 0 } },
    canPerformAction: () => false,
    getPermissionForResource
  };
}

function createPaidPlanPermissions(userId: string, suscripcion: any): UnifiedPermissionsV2 {
  const plan = suscripcion.plan;
  
  const getPermissionForResource = (resource: string) => {
    switch (resource) {
      case 'conductores': 
        return {
          allowed: plan.limite_conductores ? false : true, // Simplificado para debug
          reason: plan.limite_conductores ? `Límite: ${plan.limite_conductores} conductores` : 'Sin límite',
          limit: plan.limite_conductores
        };
      case 'vehiculos': 
        return {
          allowed: plan.limite_vehiculos ? false : true, // Simplificado para debug
          reason: plan.limite_vehiculos ? `Límite: ${plan.limite_vehiculos} vehículos` : 'Sin límite',
          limit: plan.limite_vehiculos
        };
      case 'socios': 
        return {
          allowed: plan.limite_socios ? false : true, // Simplificado para debug
          reason: plan.limite_socios ? `Límite: ${plan.limite_socios} socios` : 'Sin límite',
          limit: plan.limite_socios
        };
      case 'cartas_porte': 
        return {
          allowed: plan.limite_cartas_porte ? false : true, // Simplificado para debug
          reason: plan.limite_cartas_porte ? `Límite: ${plan.limite_cartas_porte} cartas` : 'Sin límite',
          limit: plan.limite_cartas_porte
        };
      case 'remolques': 
        return {
          allowed: true, // Los remolques generalmente no tienen límite específico
          reason: 'Incluido en su plan'
        };
      default: 
        return { allowed: false, reason: 'Recurso no reconocido' };
    }
  };
  
  return {
    userId,
    isAuthenticated: true,
    accessLevel: 'paid',
    accessReason: `Plan '${plan.nombre}' activo`,
    hasFullAccess: false,
    canCreateConductor: getPermissionForResource('conductores'),
    canCreateVehiculo: getPermissionForResource('vehiculos'),
    canCreateSocio: getPermissionForResource('socios'),
    canCreateCartaPorte: getPermissionForResource('cartas_porte'),
    canCreateRemolque: getPermissionForResource('remolques'),
    planInfo: { name: plan.nombre, type: 'paid', isActive: true },
    usage: { 
      conductores: { used: 0, limit: plan.limite_conductores }, 
      vehiculos: { used: 0, limit: plan.limite_vehiculos }, 
      socios: { used: 0, limit: plan.limite_socios }, 
      cartas_porte: { used: 0, limit: plan.limite_cartas_porte } 
    },
    canPerformAction: (action: string) => action === 'create',
    getPermissionForResource
  };
}

// NUEVA FUNCIÓN: Permisos para trial expirado sin plan
function createTrialExpiredPermissions(userId: string, trialInfo: any): UnifiedPermissionsV2 {
  const expiredAccess = { 
    allowed: false, 
    reason: 'Tu período de prueba ha finalizado. Por favor, elige un plan para continuar.' 
  };
  
  const getPermissionForResource = () => expiredAccess;
  
  return {
    userId,
    isAuthenticated: true,
    accessLevel: 'expired',
    accessReason: 'TRIAL_EXPIRED: Período de prueba finalizado sin plan activo',
    hasFullAccess: false,
    canCreateConductor: expiredAccess,
    canCreateVehiculo: expiredAccess,
    canCreateSocio: expiredAccess,
    canCreateCartaPorte: expiredAccess,
    canCreateRemolque: expiredAccess,
    planInfo: { 
      name: 'Trial Expirado', 
      type: 'none', 
      daysRemaining: trialInfo.daysRemaining,
      daysUsed: trialInfo.daysUsed,
      totalTrialDays: trialInfo.totalTrialDays,
      isActive: false 
    },
    usage: { 
      conductores: { used: 0, limit: 0 }, 
      vehiculos: { used: 0, limit: 0 }, 
      socios: { used: 0, limit: 0 }, 
      cartas_porte: { used: 0, limit: 0 } 
    },
    canPerformAction: () => false,
    getPermissionForResource
  };
}

function createExpiredPermissions(userId: string, trialInfo: any): UnifiedPermissionsV2 {
  const expiredAccess = { allowed: false, reason: 'Acceso denegado' };
  const getPermissionForResource = () => expiredAccess;
  
  return {
    userId,
    isAuthenticated: true,
    accessLevel: 'expired',
    accessReason: 'Sin acceso válido',
    hasFullAccess: false,
    canCreateConductor: expiredAccess,
    canCreateVehiculo: expiredAccess,
    canCreateSocio: expiredAccess,
    canCreateCartaPorte: expiredAccess,
    canCreateRemolque: expiredAccess,
    planInfo: { 
      name: 'Sin Acceso', 
      type: 'none', 
      daysRemaining: trialInfo?.daysRemaining || 0,
      daysUsed: trialInfo?.daysUsed || 0,
      totalTrialDays: trialInfo?.totalTrialDays || 14,
      isActive: false 
    },
    usage: { 
      conductores: { used: 0, limit: 0 }, 
      vehiculos: { used: 0, limit: 0 }, 
      socios: { used: 0, limit: 0 }, 
      cartas_porte: { used: 0, limit: 0 } 
    },
    canPerformAction: () => false,
    getPermissionForResource
  };
}
