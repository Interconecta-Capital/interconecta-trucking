
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
    console.log('🔥 ACCESS CONTROL CHECK:', {
      userId: user?.id,
      userEmail: user?.email,
      userCreatedAt: user?.created_at,
      suscripcion: suscripcion ? {
        status: suscripcion.status,
        planNombre: suscripcion.plan?.nombre
      } : null
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
    const trialEndDate = new Date(userCreatedAt.getTime() + (14 * 24 * 60 * 60 * 1000));
    const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isTrialActive = trialEndDate > now && daysRemaining > 0;

    console.log('📅 TRIAL CALCULATION:', {
      userCreatedAt: userCreatedAt.toISOString(),
      trialEndDate: trialEndDate.toISOString(),
      now: now.toISOString(),
      daysRemaining,
      isTrialActive,
      timeDiff: trialEndDate.getTime() - now.getTime()
    });

    // REGLA 1: Si tiene trial activo = ACCESO COMPLETO SIN RESTRICCIONES
    if (isTrialActive) {
      console.log('✅ TRIAL ACTIVO - ACCESO COMPLETO GARANTIZADO');
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
        limits: { cartas_porte: null, conductores: null, vehiculos: null, socios: null }
      };
    }

    // REGLA 2: Si tiene plan pagado activo = ACCESO SEGÚN LÍMITES
    if (suscripcion?.status === 'active' && suscripcion.plan) {
      console.log('✅ PLAN PAGADO ACTIVO');
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

    // REGLA 3: Sin trial ni plan = BLOQUEADO
    console.log('❌ SIN ACCESO VÁLIDO - BLOQUEADO');
    return {
      hasFullAccess: false,
      isBlocked: true,
      canCreateContent: false,
      canViewContent: true,
      isInActiveTrial: false,
      isTrialExpired: true,
      daysRemaining: 0,
      planName: 'Sin Plan',
      statusMessage: 'Trial expirado - Necesitas un plan',
      limits: { cartas_porte: 0, conductores: 0, vehiculos: 0, socios: 0 }
    };
  }, [user, suscripcion]);

  console.log('📊 ESTADO FINAL DE ACCESO:', accessState);
  
  return accessState;
};
