
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedSuperuser } from './useOptimizedSuperuser';

export interface PlanInfo {
  name: string;
  daysRemaining?: number;
  trialActive: boolean;
  limites: {
    vehiculos?: number;
    conductores?: number;
    socios?: number;
    cartas_porte?: number;
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
  };
  canCreateVehiculo: () => { allowed: boolean; reason?: string };
  canCreateConductor: () => { allowed: boolean; reason?: string };
  canCreateSocio: () => { allowed: boolean; reason?: string };
  canCreateCartaPorte: () => { allowed: boolean; reason?: string };
}

export function useUnifiedPermissionsV2(): UnifiedPermissionsV2 {
  const { user } = useAuth();

  // ✅ SECURE: Verificar superuser usando servidor (no client metadata)
  const { isSuperuser } = useOptimizedSuperuser();

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

      // Obtener contadores actuales
      const [vehiculosRes, conductoresRes, sociosRes, cartasRes] = await Promise.all([
        supabase.from('vehiculos').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('conductores').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('socios').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('cartas_porte').select('id', { count: 'exact' }).eq('usuario_id', user.id)
      ]);

      return {
        subscription,
        counts: {
          vehiculos: vehiculosRes.count || 0,
          conductores: conductoresRes.count || 0,
          socios: sociosRes.count || 0,
          cartas_porte: cartasRes.count || 0
        }
      };
    },
    enabled: !!user?.id
  });

  return useMemo(() => {
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
          vehiculos: { used: 0, limit: null },
          conductores: { used: 0, limit: null },
          socios: { used: 0, limit: null },
          cartas_porte: { used: 0, limit: null }
        },
        canCreateVehiculo: () => ({ allowed: true }),
        canCreateConductor: () => ({ allowed: true }),
        canCreateSocio: () => ({ allowed: true }),
        canCreateCartaPorte: () => ({ allowed: true })
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
          vehiculos: { used: 0, limit: 0 },
          conductores: { used: 0, limit: 0 },
          socios: { used: 0, limit: 0 },
          cartas_porte: { used: 0, limit: 0 }
        },
        canCreateVehiculo: () => ({ allowed: false, reason: 'No tienes un plan activo' }),
        canCreateConductor: () => ({ allowed: false, reason: 'No tienes un plan activo' }),
        canCreateSocio: () => ({ allowed: false, reason: 'No tienes un plan activo' }),
        canCreateCartaPorte: () => ({ allowed: false, reason: 'No tienes un plan activo' })
      };
    }

    const { subscription, counts } = permissionsData;
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
      cartas_porte: { used: counts.cartas_porte, limit: plan?.limite_cartas_porte ?? null }
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
          cartas_porte: plan?.limite_cartas_porte
        }
      },
      planDetails,
      usage,
      canCreateVehiculo: () => checkLimit('vehiculos', 'limite_vehiculos'),
      canCreateConductor: () => checkLimit('conductores', 'limite_conductores'),
      canCreateSocio: () => checkLimit('socios', 'limite_socios'),
      canCreateCartaPorte: () => checkLimit('cartas_porte', 'limite_cartas_porte')
    };
  }, [isSuperuser, permissionsData]);
}
