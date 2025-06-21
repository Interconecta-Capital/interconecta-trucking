
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useSuscripcion } from './useSuscripcion';
import { useOptimizedTrialTracking } from './useOptimizedTrialTracking';
import { useOptimizedSuperuser } from './useOptimizedSuperuser';

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
 * Hook Unificado de Permisos V2 - Construido desde cero para estabilidad
 * 
 * Implementa las 4 reglas de negocio fundamentales:
 * 1. Superusuario → Acceso total
 * 2. Trial activo → Acceso total
 * 3. Plan activo → Aplicar límites
 * 4. Sin plan → Sin acceso
 */
export const useUnifiedPermissionsV2 = (): UnifiedPermissionsV2 => {
  const { user } = useAuth();
  const { isSuperuser } = useOptimizedSuperuser();
  const { suscripcion, estaBloqueado } = useSuscripcion();
  const { trialInfo } = useOptimizedTrialTracking();

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

    // REGLA 2: TRIAL ACTIVO - Acceso total durante período de prueba
    if (trialInfo.isTrialActive && !trialInfo.isTrialExpired) {
      console.log('[UnifiedPermissionsV2] 🎯 TRIAL ACTIVO - Día', trialInfo.daysUsed, 'de', trialInfo.totalTrialDays);
      return createTrialPermissions(user.id, trialInfo);
    }

    // REGLA 3: CUENTA BLOQUEADA - Sin acceso
    if (estaBloqueado) {
      console.log('[UnifiedPermissionsV2] 🚫 CUENTA BLOQUEADA');
      return createBlockedPermissions(user.id);
    }

    // REGLA 4: PLAN ACTIVO - Aplicar límites
    if (suscripcion?.status === 'active' && suscripcion.plan) {
      console.log('[UnifiedPermissionsV2] 💳 PLAN ACTIVO:', suscripcion.plan.nombre);
      return createPaidPlanPermissions(user.id, suscripcion);
    }

    // REGLA 5: TRIAL EXPIRADO O SIN PLAN - Sin acceso
    console.log('[UnifiedPermissionsV2] ⏰ TRIAL EXPIRADO o SIN PLAN');
    return createExpiredPermissions(user.id, trialInfo);

  }, [user, isSuperuser, suscripcion, estaBloqueado, trialInfo]);
};

// Funciones auxiliares para crear objetos de permisos

function createNoAccessPermissions(reason: string): UnifiedPermissionsV2 {
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
    getPermissionForResource: () => ({ allowed: false, reason })
  };
}

function createSuperuserPermissions(userId: string): UnifiedPermissionsV2 {
  const fullAccess = { allowed: true, reason: 'Acceso de Superusuario' };
  
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
    getPermissionForResource: () => fullAccess
  };
}

function createTrialPermissions(userId: string, trialInfo: any): UnifiedPermissionsV2 {
  const trialAccess = { allowed: true, reason: `Período de prueba activo (día ${trialInfo.daysUsed} de ${trialInfo.totalTrialDays})` };
  
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
      isActive: true 
    },
    usage: { conductores: { used: 0, limit: null }, vehiculos: { used: 0, limit: null }, socios: { used: 0, limit: null }, cartas_porte: { used: 0, limit: null } },
    canPerformAction: () => true,
    getPermissionForResource: () => trialAccess
  };
}

function createBlockedPermissions(userId: string): UnifiedPermissionsV2 {
  const blockedAccess = { allowed: false, reason: 'Cuenta bloqueada por falta de pago' };
  
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
    getPermissionForResource: () => blockedAccess
  };
}

function createPaidPlanPermissions(userId: string, suscripcion: any): UnifiedPermissionsV2 {
  const plan = suscripcion.plan;
  
  return {
    userId,
    isAuthenticated: true,
    accessLevel: 'paid',
    accessReason: `Plan '${plan.nombre}' activo`,
    hasFullAccess: false,
    canCreateConductor: {
      allowed: plan.limite_conductores ? false : true, // Simplificado para debug
      reason: plan.limite_conductores ? `Límite: ${plan.limite_conductores} conductores` : 'Sin límite',
      limit: plan.limite_conductores
    },
    canCreateVehiculo: {
      allowed: plan.limite_vehiculos ? false : true, // Simplificado para debug
      reason: plan.limite_vehiculos ? `Límite: ${plan.limite_vehiculos} vehículos` : 'Sin límite',
      limit: plan.limite_vehiculos
    },
    canCreateSocio: {
      allowed: plan.limite_socios ? false : true, // Simplificado para debug
      reason: plan.limite_socios ? `Límite: ${plan.limite_socios} socios` : 'Sin límite',
      limit: plan.limite_socios
    },
    canCreateCartaPorte: {
      allowed: plan.limite_cartas_porte ? false : true, // Simplificado para debug
      reason: plan.limite_cartas_porte ? `Límite: ${plan.limite_cartas_porte} cartas` : 'Sin límite',
      limit: plan.limite_cartas_porte
    },
    canCreateRemolque: {
      allowed: true, // Los remolques generalmente no tienen límite específico
      reason: 'Incluido en su plan'
    },
    planInfo: { name: plan.nombre, type: 'paid', isActive: true },
    usage: { 
      conductores: { used: 0, limit: plan.limite_conductores }, 
      vehiculos: { used: 0, limit: plan.limite_vehiculos }, 
      socios: { used: 0, limit: plan.limite_socios }, 
      cartas_porte: { used: 0, limit: plan.limite_cartas_porte } 
    },
    canPerformAction: (action: string) => action === 'create',
    getPermissionForResource: (resource: string) => {
      switch (resource) {
        case 'conductores': return this.canCreateConductor;
        case 'vehiculos': return this.canCreateVehiculo;
        case 'socios': return this.canCreateSocio;
        case 'cartas_porte': return this.canCreateCartaPorte;
        case 'remolques': return this.canCreateRemolque;
        default: return { allowed: false, reason: 'Recurso no reconocido' };
      }
    }
  };
}

function createExpiredPermissions(userId: string, trialInfo: any): UnifiedPermissionsV2 {
  const expiredAccess = { allowed: false, reason: 'Período de prueba finalizado' };
  
  return {
    userId,
    isAuthenticated: true,
    accessLevel: 'expired',
    accessReason: 'Período de prueba finalizado',
    hasFullAccess: false,
    canCreateConductor: expiredAccess,
    canCreateVehiculo: expiredAccess,
    canCreateSocio: expiredAccess,
    canCreateCartaPorte: expiredAccess,
    canCreateRemolque: expiredAccess,
    planInfo: { name: 'Trial Expirado', type: 'none', isActive: false },
    usage: { conductores: { used: 0, limit: 0 }, vehiculos: { used: 0, limit: 0 }, socios: { used: 0, limit: 0 }, cartas_porte: { used: 0, limit: 0 } },
    canPerformAction: () => false,
    getPermissionForResource: () => expiredAccess
  };
}
