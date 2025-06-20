
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useSuscripcion } from './useSuscripcion';
import { useSuperuser } from './useSuperuser';
import { useTrialTracking } from './useTrialTracking';

export interface AccessControlState {
  // Estados principales
  hasFullAccess: boolean;
  isBlocked: boolean;
  canCreateContent: boolean;
  canViewContent: boolean;
  
  // Información del trial
  isInActiveTrial: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  
  // Información del plan
  planName: string;
  isSuperuser: boolean;
  
  // Estados críticos
  restrictionType: 'none' | 'trial_expired' | 'payment_suspended' | 'grace_period';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Mensajes
  statusMessage: string;
  actionRequired: string;
  
  // Límites y uso
  limits: {
    cartas_porte: number | null;
    conductores: number | null;
    vehiculos: number | null;
    socios: number | null;
  };
}

export const useUnifiedAccessControl = (): AccessControlState => {
  const { user } = useAuth();
  const { isSuperuser } = useSuperuser();
  const { suscripcion, estaBloqueado } = useSuscripcion();
  const { trialInfo, loading: trialLoading } = useTrialTracking();

  const accessState = useMemo((): AccessControlState => {
    console.log('🔐 SIMPLIFICADO - UnifiedAccessControl evaluando:', {
      userId: user?.id,
      isSuperuser,
      trialInfo,
      suscripcion,
      loading: trialLoading
    });

    // 1. SUPERUSER: Acceso total siempre
    if (isSuperuser) {
      console.log('✅ SUPERUSER: Acceso completo');
      return {
        hasFullAccess: true,
        isBlocked: false,
        canCreateContent: true,
        canViewContent: true,
        isInActiveTrial: false,
        isTrialExpired: false,
        daysRemaining: 0,
        planName: 'Superuser',
        isSuperuser: true,
        restrictionType: 'none',
        urgencyLevel: 'low',
        statusMessage: 'Acceso completo de superusuario',
        actionRequired: '',
        limits: {
          cartas_porte: null,
          conductores: null,
          vehiculos: null,
          socios: null
        }
      };
    }

    const now = new Date();
    
    // 2. VERIFICAR TRIAL ACTIVO PRIMERO (prioridad máxima)
    if (trialInfo?.trialEndDate) {
      const trialEndDate = new Date(trialInfo.trialEndDate);
      const isTrialActive = trialEndDate > now;
      const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      console.log('📅 VERIFICACIÓN DE TRIAL:', {
        trialEndDate: trialEndDate.toISOString(),
        now: now.toISOString(),
        isTrialActive,
        daysRemaining
      });

      // Si el trial está activo, DAR ACCESO COMPLETO sin más verificaciones
      if (isTrialActive && daysRemaining > 0) {
        console.log('✅ TRIAL ACTIVO: Acceso completo garantizado');
        return {
          hasFullAccess: true,
          isBlocked: false,
          canCreateContent: true,
          canViewContent: true,
          isInActiveTrial: true,
          isTrialExpired: false,
          daysRemaining,
          planName: 'Trial',
          isSuperuser: false,
          restrictionType: 'none',
          urgencyLevel: daysRemaining <= 3 ? 'medium' : 'low',
          statusMessage: `Trial activo: ${daysRemaining} días restantes`,
          actionRequired: daysRemaining <= 3 ? 'Considere adquirir un plan' : '',
          limits: {
            cartas_porte: 10,
            conductores: 5,
            vehiculos: 5,
            socios: 10
          }
        };
      }
    }

    // 3. VERIFICAR SUSCRIPCIÓN PAGADA ACTIVA
    if (suscripcion?.status === 'active' && suscripcion.plan) {
      const planEndDate = suscripcion.fecha_vencimiento ? new Date(suscripcion.fecha_vencimiento) : null;
      const isPlanActive = !planEndDate || planEndDate > now;
      
      if (isPlanActive) {
        console.log('✅ PLAN PAGADO ACTIVO: Acceso completo');
        return {
          hasFullAccess: true,
          isBlocked: false,
          canCreateContent: true,
          canViewContent: true,
          isInActiveTrial: false,
          isTrialExpired: false,
          daysRemaining: 0,
          planName: suscripcion.plan.nombre,
          isSuperuser: false,
          restrictionType: 'none',
          urgencyLevel: 'low',
          statusMessage: `Plan activo: ${suscripcion.plan.nombre}`,
          actionRequired: '',
          limits: {
            cartas_porte: suscripcion.plan.limite_cartas_porte,
            conductores: suscripcion.plan.limite_conductores,
            vehiculos: suscripcion.plan.limite_vehiculos,
            socios: suscripcion.plan.limite_socios
          }
        };
      }
    }

    // 4. VERIFICAR BLOQUEO ADMINISTRATIVO (solo después de verificar acceso válido)
    if (estaBloqueado && estaBloqueado()) {
      console.log('🚫 BLOQUEADO: Bloqueo administrativo detectado');
      return {
        hasFullAccess: false,
        isBlocked: true,
        canCreateContent: false,
        canViewContent: true,
        isInActiveTrial: false,
        isTrialExpired: true,
        daysRemaining: 0,
        planName: 'Bloqueado',
        isSuperuser: false,
        restrictionType: 'payment_suspended',
        urgencyLevel: 'critical',
        statusMessage: 'Cuenta bloqueada por administración',
        actionRequired: 'Contacte al administrador para reactivar su cuenta',
        limits: {
          cartas_porte: 0,
          conductores: 0,
          vehiculos: 0,
          socios: 0
        }
      };
    }

    // 5. VERIFICAR PERÍODO DE GRACIA
    if (suscripcion?.status === 'grace_period' && suscripcion.grace_period_end) {
      const gracePeriodEnd = new Date(suscripcion.grace_period_end);
      const isInGracePeriod = gracePeriodEnd > now;
      const graceDaysRemaining = Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      if (isInGracePeriod) {
        return {
          hasFullAccess: false,
          isBlocked: false,
          canCreateContent: false,
          canViewContent: true,
          isInActiveTrial: false,
          isTrialExpired: true,
          daysRemaining: graceDaysRemaining,
          planName: 'Período de Gracia',
          isSuperuser: false,
          restrictionType: 'grace_period',
          urgencyLevel: graceDaysRemaining <= 7 ? 'critical' : 'high',
          statusMessage: `Período de gracia: ${graceDaysRemaining} días restantes`,
          actionRequired: graceDaysRemaining <= 7 ? 'URGENTE: Adquiera un plan o sus datos serán eliminados' : 'Renueve su suscripción',
          limits: {
            cartas_porte: 0,
            conductores: 0,
            vehiculos: 0,
            socios: 0
          }
        };
      }
    }

    // 6. CASO POR DEFECTO: Sin acceso válido
    console.log('❌ SIN ACCESO VÁLIDO: Acceso denegado');
    return {
      hasFullAccess: false,
      isBlocked: true,
      canCreateContent: false,
      canViewContent: true,
      isInActiveTrial: false,
      isTrialExpired: true,
      daysRemaining: 0,
      planName: 'Sin Plan',
      isSuperuser: false,
      restrictionType: 'trial_expired',
      urgencyLevel: 'high',
      statusMessage: 'No tiene una suscripción válida',
      actionRequired: 'Adquiera un plan para usar la plataforma',
      limits: {
        cartas_porte: 0,
        conductores: 0,
        vehiculos: 0,
        socios: 0
      }
    };
  }, [user, isSuperuser, suscripcion, trialInfo, estaBloqueado, trialLoading]);

  console.log('📊 ESTADO FINAL SIMPLIFICADO:', accessState);
  
  return accessState;
};

// Función de utilidad simplificada
export const usePermissionCheck = () => {
  const accessState = useUnifiedAccessControl();
  
  const canPerformAction = (action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (accessState.isSuperuser) return true;
    
    switch (action) {
      case 'read':
        return accessState.canViewContent;
      case 'create':
      case 'update':
      case 'delete':
        return accessState.canCreateContent;
      default:
        return false;
    }
  };

  const canAccessResource = (resource: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios'): boolean => {
    if (accessState.isSuperuser) return true;
    return accessState.canViewContent;
  };

  const canCreateResource = (resource: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios'): boolean => {
    if (accessState.isSuperuser) return true;
    return accessState.canCreateContent;
  };

  return {
    ...accessState,
    canPerformAction,
    canAccessResource,
    canCreateResource
  };
};
