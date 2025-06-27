
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealTimeCounts } from './useRealTimeCounts';

export interface PlanInfo {
  name: string;
  daysRemaining?: number;
  trialActive: boolean;
  limites: {
    vehiculos?: number;
    conductores?: number;
    socios?: number;
    cartas_porte?: number;
    remolques?: number;
    viajes?: number;
  };
}

export interface UnifiedPermissionsV2 {
  accessLevel: 'superuser' | 'trial' | 'paid' | 'blocked' | 'expired';
  hasFullAccess: boolean;
  planInfo: PlanInfo;
  planDetails: { feature: string; included: boolean }[];
  usage: {
    vehiculos: { used: number; limit: number | null };
    conductores: { used: number; limit: number | null };
    socios: { used: number; limit: number | null };
    cartas_porte: { used: number; limit: number | null };
    remolques: { used: number; limit: number | null };
    viajes: { used: number; limit: number | null };
  };
  canCreateVehiculo: () => { allowed: boolean; reason?: string };
  canCreateConductor: () => { allowed: boolean; reason?: string };
  canCreateSocio: () => { allowed: boolean; reason?: string };
  canCreateCartaPorte: () => { allowed: boolean; reason?: string };
  canCreateRemolque: () => { allowed: boolean; reason?: string };
  canCreateViaje: () => { allowed: boolean; reason?: string };
}

export function useUnifiedPermissionsV2(): UnifiedPermissionsV2 {
  const { user } = useAuth();
  const { data: realCounts } = useRealTimeCounts();

  // Verificar si es superusuario directamente desde auth metadata
  const isSuperuser = useMemo(() => {
    return user?.user_metadata?.is_superuser === true || 
           user?.user_metadata?.is_superuser === 'true';
  }, [user]);

  // Obtener datos del plan y contadores
  const { data: permissionsData } = useQuery({
    queryKey: ['unified-permissions-v2', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Obtener suscripción activa
      const { data: subscription } = await supabase
        .from('suscripciones')
        .select(`
          *,
          planes_suscripcion(*)
        `)
        .eq('user_id', user.id)
        .in('status', ['trial', 'active'])
        .single();

      return { subscription };
    },
    enabled: !!user?.id
  });

  return useMemo(() => {
    // Usar contadores reales si están disponibles
    const counts = realCounts || {
      vehiculos: 0,
      conductores: 0,
      socios: 0,
      cartas_porte: 0,
      remolques: 0,
      viajes: 0
    };

    // Superusuarios tienen acceso completo
    if (isSuperuser) {
      return {
        accessLevel: 'superuser' as const,
        hasFullAccess: true,
        planInfo: {
          name: 'Superusuario',
          trialActive: false,
          limites: {}
        },
        planDetails: [],
        usage: {
          vehiculos: { used: counts.vehiculos, limit: null },
          conductores: { used: counts.conductores, limit: null },
          socios: { used: counts.socios, limit: null },
          cartas_porte: { used: counts.cartas_porte, limit: null },
          remolques: { used: counts.remolques, limit: null },
          viajes: { used: counts.viajes, limit: null }
        },
        canCreateVehiculo: () => ({ allowed: true }),
        canCreateConductor: () => ({ allowed: true }),
        canCreateSocio: () => ({ allowed: true }),
        canCreateCartaPorte: () => ({ allowed: true }),
        canCreateRemolque: () => ({ allowed: true }),
        canCreateViaje: () => ({ allowed: true })
      };
    }

    if (!permissionsData?.subscription) {
      return {
        accessLevel: 'blocked' as const,
        hasFullAccess: false,
        planInfo: {
          name: 'Sin Plan',
          trialActive: false,
          limites: {}
        },
        planDetails: [],
        usage: {
          vehiculos: { used: counts.vehiculos, limit: 0 },
          conductores: { used: counts.conductores, limit: 0 },
          socios: { used: counts.socios, limit: 0 },
          cartas_porte: { used: counts.cartas_porte, limit: 0 },
          remolques: { used: counts.remolques, limit: 0 },
          viajes: { used: counts.viajes, limit: 0 }
        },
        canCreateVehiculo: () => ({ allowed: false, reason: 'No tienes un plan activo' }),
        canCreateConductor: () => ({ allowed: false, reason: 'No tienes un plan activo' }),
        canCreateSocio: () => ({ allowed: false, reason: 'No tienes un plan activo' }),
        canCreateCartaPorte: () => ({ allowed: false, reason: 'No tienes un plan activo' }),
        canCreateRemolque: () => ({ allowed: false, reason: 'No tienes un plan activo' }),
        canCreateViaje: () => ({ allowed: false, reason: 'No tienes un plan activo' })
      };
    }

    const { subscription } = permissionsData;
    const plan = subscription.planes_suscripcion;
    const isTrialActive = subscription.status === 'trial';

    // Calcular días restantes para trial
    const daysRemaining = isTrialActive && subscription.fecha_fin_prueba 
      ? Math.max(0, Math.ceil((new Date(subscription.fecha_fin_prueba).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : undefined;

    const accessLevel = isTrialActive ? 'trial' : 'paid';

    // Función para verificar límites
    const checkLimit = (resource: keyof typeof counts, limitKey: keyof typeof plan): { allowed: boolean; reason?: string } => {
      const limit = plan?.[limitKey] as number | null;
      const currentCount = counts[resource];

      // Si no hay límite definido o es null, permitir creación
      if (!limit || limit === null) {
        return { allowed: true };
      }

      // Si está por debajo del límite, permitir
      if (currentCount < limit) {
        return { allowed: true };
      }

      // Si alcanzó el límite, denegar
      return { 
        allowed: false, 
        reason: `Has alcanzado el límite de ${limit} ${resource} para tu plan` 
      };
    };

    const planDetails = [
      {
        feature: plan.limite_cartas_porte ? `${plan.limite_cartas_porte} cartas porte` : 'Cartas porte ilimitadas',
        included: true
      },
      {
        feature: plan.limite_conductores ? `${plan.limite_conductores} conductores` : 'Conductores ilimitados',
        included: true
      },
      {
        feature: plan.limite_vehiculos ? `${plan.limite_vehiculos} vehículos` : 'Vehículos ilimitados',
        included: true
      },
      {
        feature: plan.limite_socios ? `${plan.limite_socios} socios` : 'Socios ilimitados',
        included: true
      },
      { feature: 'Generación de XML', included: !!plan.puede_generar_xml },
      { feature: 'Timbrado automático', included: !!plan.puede_timbrar },
      { feature: 'Cancelación de CFDI', included: !!plan.puede_cancelar_cfdi },
      { feature: 'Tracking en tiempo real', included: !!plan.puede_tracking }
    ];

    const usage = {
      vehiculos: { used: counts.vehiculos, limit: plan?.limite_vehiculos ?? null },
      conductores: { used: counts.conductores, limit: plan?.limite_conductores ?? null },
      socios: { used: counts.socios, limit: plan?.limite_socios ?? null },
      cartas_porte: { used: counts.cartas_porte, limit: plan?.limite_cartas_porte ?? null },
      remolques: { used: counts.remolques, limit: plan?.limite_remolques ?? null },
      viajes: { used: counts.viajes, limit: plan?.limite_viajes ?? null }
    };

    return {
      accessLevel,
      hasFullAccess: true,
      planInfo: {
        name: plan?.nombre || 'Plan Desconocido',
        daysRemaining,
        trialActive: isTrialActive,
        limites: {
          vehiculos: plan?.limite_vehiculos,
          conductores: plan?.limite_conductores,
          socios: plan?.limite_socios,
          cartas_porte: plan?.limite_cartas_porte,
          remolques: plan?.limite_remolques,
          viajes: plan?.limite_viajes
        }
      },
      planDetails,
      usage,
      canCreateVehiculo: () => checkLimit('vehiculos', 'limite_vehiculos'),
      canCreateConductor: () => checkLimit('conductores', 'limite_conductores'),
      canCreateSocio: () => checkLimit('socios', 'limite_socios'),
      canCreateCartaPorte: () => checkLimit('cartas_porte', 'limite_cartas_porte'),
      canCreateRemolque: () => checkLimit('remolques', 'limite_remolques'),
      canCreateViaje: () => checkLimit('viajes', 'limite_viajes')
    };
  }, [isSuperuser, permissionsData, realCounts]);
}
