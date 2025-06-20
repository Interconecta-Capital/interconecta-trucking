
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useSuscripcion } from './useSuscripcion';

export interface SimpleAccessState {
  // Estados principales
  hasFullAccess: boolean;
  isBlocked: boolean;
  canCreateContent: boolean;
  canViewContent: boolean;
  
  // Información del estado
  isInActiveTrial: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  planName: string;
  
  // Mensaje para mostrar al usuario
  statusMessage: string;
  
  // Límites (si está en plan pagado)
  limits: {
    cartas_porte: number | null;
    conductores: number | null;
    vehiculos: number | null;
    socios: number | null;
  };
}

export const useSimpleAccessControl = (): SimpleAccessState => {
  const { user } = useAuth();
  const { suscripcion } = useSuscripcion();

  const accessState = useMemo((): SimpleAccessState => {
    console.log('🔥 SIMPLE ACCESS CONTROL:', {
      userId: user?.id,
      userCreatedAt: user?.created_at,
      suscripcion
    });

    if (!user) {
      return {
        hasFullAccess: false,
        isBlocked: true,
        canCreateContent: false,
        canViewContent: false,
        isInActiveTrial: false,
        isTrialExpired: true,
        daysRemaining: 0,
        planName: 'Sin Acceso',
        statusMessage: 'Inicia sesión para acceder',
        limits: { cartas_porte: 0, conductores: 0, vehiculos: 0, socios: 0 }
      };
    }

    const now = new Date();
    const userCreatedAt = new Date(user.created_at);
    const trialEndDate = new Date(userCreatedAt.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 días después de creación
    const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isTrialActive = trialEndDate > now;

    console.log('📅 TRIAL CALCULATION:', {
      userCreatedAt: userCreatedAt.toISOString(),
      trialEndDate: trialEndDate.toISOString(),
      now: now.toISOString(),
      daysRemaining,
      isTrialActive
    });

    // 1. VERIFICAR SI TIENE TRIAL ACTIVO (14 días desde creación)
    if (isTrialActive && daysRemaining > 0) {
      console.log('✅ TRIAL ACTIVO - Acceso completo');
      return {
        hasFullAccess: true,
        isBlocked: false,
        canCreateContent: true,
        canViewContent: true,
        isInActiveTrial: true,
        isTrialExpired: false,
        daysRemaining,
        planName: 'Trial',
        statusMessage: `Trial activo: ${daysRemaining} días restantes`,
        limits: { cartas_porte: null, conductores: null, vehiculos: null, socios: null } // Sin límites en trial
      };
    }

    // 2. VERIFICAR SI TIENE PLAN PAGADO ACTIVO
    if (suscripcion?.status === 'active' && suscripcion.plan) {
      console.log('✅ PLAN PAGADO - Acceso según límites del plan');
      return {
        hasFullAccess: true,
        isBlocked: false,
        canCreateContent: true,
        canViewContent: true,
        isInActiveTrial: false,
        isTrialExpired: true,
        daysRemaining: 0,
        planName: suscripcion.plan.nombre,
        statusMessage: `Plan activo: ${suscripcion.plan.nombre}`,
        limits: {
          cartas_porte: suscripcion.plan.limite_cartas_porte,
          conductores: suscripcion.plan.limite_conductores,
          vehiculos: suscripcion.plan.limite_vehiculos,
          socios: suscripcion.plan.limite_socios
        }
      };
    }

    // 3. SIN TRIAL NI PLAN PAGADO = BLOQUEADO
    console.log('❌ SIN ACCESO VÁLIDO - Bloqueado');
    return {
      hasFullAccess: false,
      isBlocked: true,
      canCreateContent: false,
      canViewContent: true, // Puede ver pero no crear
      isInActiveTrial: false,
      isTrialExpired: true,
      daysRemaining: 0,
      planName: 'Sin Plan',
      statusMessage: 'Trial expirado - Adquiere un plan para continuar',
      limits: { cartas_porte: 0, conductores: 0, vehiculos: 0, socios: 0 }
    };
  }, [user, suscripcion]);

  console.log('📊 ESTADO FINAL SIMPLE:', accessState);
  
  return accessState;
};
