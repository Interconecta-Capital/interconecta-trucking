
import { useUnifiedPermissionsV2 } from './useUnifiedPermissionsV2';

/**
 * Hook de compatibilidad que mantiene la interfaz existente
 * mientras usa el nuevo sistema unificado V2 por debajo
 * @deprecated Usar useUnifiedPermissionsV2 directamente para nuevos desarrollos
 */
export const usePermissions = () => {
  const unified = useUnifiedPermissionsV2();
  
  return {
    // Compatibilidad con la interfaz anterior
    hasFullAccess: unified.hasFullAccess,
    isSuperuser: unified.accessLevel === 'superuser',
    isTrialActive: unified.accessLevel === 'trial',
    isBlocked: unified.accessLevel === 'blocked',
    isExpired: unified.accessLevel === 'expired',
    
    // NUEVA PROPIEDAD CRÍTICA: Detectar trial expirado específicamente
    isTrialExpired: unified.accessLevel === 'expired' && unified.accessReason.includes('TRIAL_EXPIRED'),
    
    // Permisos específicos
    canCreateConductor: unified.canCreateConductor.allowed,
    canCreateVehiculo: unified.canCreateVehiculo.allowed,
    canCreateSocio: unified.canCreateSocio.allowed,
    canCreateCartaPorte: unified.canCreateCartaPorte.allowed,
    
    // Funcionalidades
    canTimbrar: unified.canCreateCartaPorte.allowed,
    canGenerateXML: unified.canCreateCartaPorte.allowed,
    canCancelCFDI: unified.canCreateCartaPorte.allowed,
    canUseTracking: unified.hasFullAccess,
    canAccessAdmin: unified.accessLevel === 'superuser',
    canAccessAdvanced: unified.hasFullAccess,
    canAccessEnterprise: unified.accessLevel === 'superuser',
    
    // Información adicional
    planName: unified.planInfo.name,
    accessReason: unified.accessReason,
    
    // Información específica del trial (FUENTE ÚNICA DE VERDAD)
    trialDaysRemaining: unified.planInfo.daysRemaining,
    trialDaysUsed: unified.planInfo.daysUsed,
    trialTotalDays: unified.planInfo.totalTrialDays,
    
    // Acceso al objeto completo para casos avanzados
    unified
  };
};
