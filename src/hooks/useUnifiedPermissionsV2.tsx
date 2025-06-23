
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  canCreateVehiculo: () => { allowed: boolean; reason?: string };
  canCreateConductor: () => { allowed: boolean; reason?: string };
  canCreateSocio: () => { allowed: boolean; reason?: string };
  canCreateCartaPorte: () => { allowed: boolean; reason?: string };
}

export function useUnifiedPermissionsV2(): UnifiedPermissionsV2 {
  const { user } = useAuth();

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
      canCreateVehiculo: () => checkLimit('vehiculos', 'limite_vehiculos'),
      canCreateConductor: () => checkLimit('conductores', 'limite_conductores'),
      canCreateSocio: () => checkLimit('socios', 'limite_socios'),
      canCreateCartaPorte: () => checkLimit('cartas_porte', 'limite_cartas_porte')
    };
  }, [isSuperuser, permissionsData]);
}
