
import { useUnifiedPermissions } from './useUnifiedPermissions';

/**
 * Hook de compatibilidad que mantiene la interfaz existente
 * mientras usa el nuevo sistema unificado por debajo
 * @deprecated Usar useUnifiedPermissions directamente para nuevos desarrollos
 */
export const usePermissions = () => {
  const unified = useUnifiedPermissions();
  
  return {
    // Compatibilidad con la interfaz anterior
    hasFullAccess: unified.hasFullAccess,
    isSuperuser: unified.accessLevel === 'superuser',
    isTrialActive: unified.accessLevel === 'trial',
    isBlocked: unified.accessLevel === 'blocked',
    isExpired: unified.accessLevel === 'expired',
    
    // Permisos específicos
    canCreateConductor: unified.canCreateConductor.allowed,
    canCreateVehiculo: unified.canCreateVehiculo.allowed,
    canCreateSocio: unified.canCreateSocio.allowed,
    canCreateCartaPorte: unified.canCreateCartaPorte.allowed,
    
    // Funcionalidades
    canTimbrar: unified.canTimbrar.allowed,
    canGenerateXML: unified.canGenerateXML.allowed,
    canCancelCFDI: unified.canCancelCFDI.allowed,
    canUseTracking: unified.canUseTracking.allowed,
    canAccessAdmin: unified.canAccessAdmin.allowed,
    canAccessAdvanced: unified.canAccessAdvanced.allowed,
    canAccessEnterprise: unified.canAccessEnterprise.allowed,
    
    // Información adicional
    planName: unified.planInfo.name,
    accessReason: unified.accessReason,
    
    // Acceso al objeto completo para casos avanzados
    unified
  };
};
