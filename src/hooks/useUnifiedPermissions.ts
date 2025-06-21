
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useSuscripcion } from './useSuscripcion';
import { useOptimizedTrialTracking } from './useOptimizedTrialTracking';
import { useOptimizedSuperuser } from './useOptimizedSuperuser';
import { useConductores } from './useConductores';
import { useVehiculos } from './useVehiculos';
import { useSocios } from './useSocios';
import { useCartasPorte } from './useCartasPorte';
import { differenceInDays } from 'date-fns';

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
    cartasPorte: { used: number; limit: number | null };
  };
  
  // Información del plan
  planInfo: {
    name: string;
    type: 'trial' | 'paid' | 'none';
    daysRemaining?: number;
    expiresAt?: Date;
  };
}

export const useUnifiedPermissions = (): UnifiedPermissions => {
  const { user } = useAuth();
  const { isSuperuser } = useOptimizedSuperuser();
  const { suscripcion, verificarLimite, estaBloqueado } = useSuscripcion();
  const { trialInfo } = useOptimizedTrialTracking();
  
  // Hooks para conteo de recursos
  const { conductores } = useConductores();
  const { vehiculos } = useVehiculos();
  const { socios } = useSocios();
  const { cartasPorte } = useCartasPorte();

  return useMemo(() => {
    // REGLA 1: SUPERUSUARIO (Acceso Total e Incondicional)
    if (isSuperuser) {
      return {
        hasFullAccess: true,
        accessLevel: 'superuser' as const,
        accessReason: 'Acceso de Superusuario - Sin restricciones',
        
        canCreateConductor: { allowed: true, reason: 'Superusuario' },
        canCreateVehiculo: { allowed: true, reason: 'Superusuario' },
        canCreateSocio: { allowed: true, reason: 'Superusuario' },
        canCreateCartaPorte: { allowed: true, reason: 'Superusuario' },
        
        canTimbrar: { allowed: true, reason: 'Superusuario' },
        canGenerateXML: { allowed: true, reason: 'Superusuario' },
        canCancelCFDI: { allowed: true, reason: 'Superusuario' },
        canUseTracking: { allowed: true, reason: 'Superusuario' },
        canAccessAdmin: { allowed: true, reason: 'Superusuario' },
        canAccessAdvanced: { allowed: true, reason: 'Superusuario' },
        canAccessEnterprise: { allowed: true, reason: 'Superusuario' },
        
        usage: {
          conductores: { used: conductores?.length || 0, limit: null },
          vehiculos: { used: vehiculos?.length || 0, limit: null },
          socios: { used: socios?.length || 0, limit: null },
          cartasPorte: { used: cartasPorte?.length || 0, limit: null },
        },
        
        planInfo: {
          name: 'Acceso de Superusuario',
          type: 'paid' as const
        }
      };
    }

    // REGLA 2: PERIODO DE PRUEBA (14 Días)
    if (trialInfo.isTrialActive && !trialInfo.isTrialExpired) {
      return {
        hasFullAccess: true,
        accessLevel: 'trial' as const,
        accessReason: `Día ${trialInfo.daysUsed} de ${trialInfo.totalTrialDays} de prueba gratuita`,
        
        canCreateConductor: { allowed: true, reason: 'Período de prueba activo' },
        canCreateVehiculo: { allowed: true, reason: 'Período de prueba activo' },
        canCreateSocio: { allowed: true, reason: 'Período de prueba activo' },
        canCreateCartaPorte: { allowed: true, reason: 'Período de prueba activo' },
        
        canTimbrar: { allowed: true, reason: 'Período de prueba activo' },
        canGenerateXML: { allowed: true, reason: 'Período de prueba activo' },
        canCancelCFDI: { allowed: true, reason: 'Período de prueba activo' },
        canUseTracking: { allowed: true, reason: 'Período de prueba activo' },
        canAccessAdmin: { allowed: true, reason: 'Período de prueba activo' },
        canAccessAdvanced: { allowed: true, reason: 'Período de prueba activo' },
        canAccessEnterprise: { allowed: false, reason: 'Funciones Enterprise requieren plan pagado' },
        
        usage: {
          conductores: { used: conductores?.length || 0, limit: null },
          vehiculos: { used: vehiculos?.length || 0, limit: null },
          socios: { used: socios?.length || 0, limit: null },
          cartasPorte: { used: cartasPorte?.length || 0, limit: null },
        },
        
        planInfo: {
          name: 'Período de Prueba Gratuita',
          type: 'trial' as const,
          daysRemaining: trialInfo.daysRemaining,
          expiresAt: trialInfo.trialEndDate || undefined
        }
      };
    }

    // REGLA 3: CUENTA BLOQUEADA
    if (estaBloqueado) {
      return {
        hasFullAccess: false,
        accessLevel: 'blocked' as const,
        accessReason: 'Cuenta bloqueada por falta de pago',
        
        canCreateConductor: { allowed: false, reason: 'Cuenta bloqueada' },
        canCreateVehiculo: { allowed: false, reason: 'Cuenta bloqueada' },
        canCreateSocio: { allowed: false, reason: 'Cuenta bloqueada' },
        canCreateCartaPorte: { allowed: false, reason: 'Cuenta bloqueada' },
        
        canTimbrar: { allowed: false, reason: 'Cuenta bloqueada' },
        canGenerateXML: { allowed: false, reason: 'Cuenta bloqueada' },
        canCancelCFDI: { allowed: false, reason: 'Cuenta bloqueada' },
        canUseTracking: { allowed: false, reason: 'Cuenta bloqueada' },
        canAccessAdmin: { allowed: false, reason: 'Cuenta bloqueada' },
        canAccessAdvanced: { allowed: false, reason: 'Cuenta bloqueada' },
        canAccessEnterprise: { allowed: false, reason: 'Cuenta bloqueada' },
        
        usage: {
          conductores: { used: conductores?.length || 0, limit: 0 },
          vehiculos: { used: vehiculos?.length || 0, limit: 0 },
          socios: { used: socios?.length || 0, limit: 0 },
          cartasPorte: { used: cartasPorte?.length || 0, limit: 0 },
        },
        
        planInfo: {
          name: 'Cuenta Bloqueada',
          type: 'none' as const
        }
      };
    }

    // REGLA 4: SUSCRIPCIÓN ACTIVA Y LÍMITES
    if (suscripcion?.status === 'active' && suscripcion.plan) {
      const plan = suscripcion.plan;
      const conductoresUsed = conductores?.length || 0;
      const vehiculosUsed = vehiculos?.length || 0;
      const sociosUsed = socios?.length || 0;
      const cartasPorteUsed = cartasPorte?.length || 0;
      
      return {
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
          cartasPorte: { used: cartasPorteUsed, limit: plan.limite_cartas_porte },
        },
        
        planInfo: {
          name: plan.nombre,
          type: 'paid' as const,
          expiresAt: suscripcion.fecha_vencimiento ? new Date(suscripcion.fecha_vencimiento) : undefined
        }
      };
    }

    // REGLA 5: PERÍODO DE GRACIA O TRIAL EXPIRADO
    if (trialInfo.isTrialExpired || trialInfo.isInGracePeriod) {
      return {
        hasFullAccess: false,
        accessLevel: 'expired' as const,
        accessReason: trialInfo.isInGracePeriod ? 
          'Período de gracia - Solo lectura' : 
          'Período de prueba finalizado',
        
        canCreateConductor: { allowed: false, reason: 'Período de prueba finalizado' },
        canCreateVehiculo: { allowed: false, reason: 'Período de prueba finalizado' },
        canCreateSocio: { allowed: false, reason: 'Período de prueba finalizado' },
        canCreateCartaPorte: { allowed: false, reason: 'Período de prueba finalizado' },
        
        canTimbrar: { allowed: false, reason: 'Período de prueba finalizado' },
        canGenerateXML: { allowed: false, reason: 'Período de prueba finalizado' },
        canCancelCFDI: { allowed: false, reason: 'Período de prueba finalizado' },
        canUseTracking: { allowed: false, reason: 'Período de prueba finalizado' },
        canAccessAdmin: { allowed: false, reason: 'Período de prueba finalizado' },
        canAccessAdvanced: { allowed: false, reason: 'Período de prueba finalizado' },
        canAccessEnterprise: { allowed: false, reason: 'Período de prueba finalizado' },
        
        usage: {
          conductores: { used: conductores?.length || 0, limit: 0 },
          vehiculos: { used: vehiculos?.length || 0, limit: 0 },
          socios: { used: socios?.length || 0, limit: 0 },
          cartasPorte: { used: cartasPorte?.length || 0, limit: 0 },
        },
        
        planInfo: {
          name: trialInfo.isInGracePeriod ? 'Período de Gracia' : 'Trial Expirado',
          type: 'none' as const
        }
      };
    }

    // REGLA 6: POR DEFECTO (SIN ACCESO)
    return {
      hasFullAccess: false,
      accessLevel: 'expired' as const,
      accessReason: 'No tiene plan activo',
      
      canCreateConductor: { allowed: false, reason: 'No tiene plan activo' },
      canCreateVehiculo: { allowed: false, reason: 'No tiene plan activo' },
      canCreateSocio: { allowed: false, reason: 'No tiene plan activo' },
      canCreateCartaPorte: { allowed: false, reason: 'No tiene plan activo' },
      
      canTimbrar: { allowed: false, reason: 'No tiene plan activo' },
      canGenerateXML: { allowed: false, reason: 'No tiene plan activo' },
      canCancelCFDI: { allowed: false, reason: 'No tiene plan activo' },
      canUseTracking: { allowed: false, reason: 'No tiene plan activo' },
      canAccessAdmin: { allowed: false, reason: 'No tiene plan activo' },
      canAccessAdvanced: { allowed: false, reason: 'No tiene plan activo' },
      canAccessEnterprise: { allowed: false, reason: 'No tiene plan activo' },
      
      usage: {
        conductores: { used: conductores?.length || 0, limit: 0 },
        vehiculos: { used: vehiculos?.length || 0, limit: 0 },
        socios: { used: socios?.length || 0, limit: 0 },
        cartasPorte: { used: cartasPorte?.length || 0, limit: 0 },
      },
      
      planInfo: {
        name: 'Sin Plan',
        type: 'none' as const
      }
    };
  }, [
    isSuperuser,
    suscripcion,
    trialInfo,
    estaBloqueado,
    conductores?.length,
    vehiculos?.length,
    socios?.length,
    cartasPorte?.length
  ]);
};
