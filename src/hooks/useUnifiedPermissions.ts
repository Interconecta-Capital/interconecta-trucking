
import { usePermissions } from './usePermissions';

export interface PermissionResult {
  allowed: boolean;
  reason: string;
  limit?: number;
  used?: number;
}

/**
 * Unified permissions hook that provides backward compatibility
 * with all existing permission interfaces
 */
export const useUnifiedPermissions = () => {
  const permissions = usePermissions();
  
  // Map resource types to permission checks
  const getPermissionForResource = (resource: string): PermissionResult => {
    switch (resource) {
      case 'conductores':
        return {
          allowed: permissions.canCreateConductor,
          reason: permissions.canCreateConductor ? 'Permitido' : permissions.accessReason
        };
      case 'vehiculos':
        return {
          allowed: permissions.canCreateVehiculo,
          reason: permissions.canCreateVehiculo ? 'Permitido' : permissions.accessReason
        };
      case 'socios':
        return {
          allowed: permissions.canCreateSocio,
          reason: permissions.canCreateSocio ? 'Permitido' : permissions.accessReason
        };
      case 'cartas_porte':
        return {
          allowed: permissions.canCreateCartaPorte,
          reason: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason
        };
      case 'viajes':
        return {
          allowed: permissions.canCreateCartaPorte, // Viajes depend on carta porte creation
          reason: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason
        };
      default:
        return {
          allowed: false,
          reason: 'Recurso no reconocido'
        };
    }
  };

  return {
    // Original permissions interface
    ...permissions,
    
    // Additional properties for backward compatibility
    accessLevel: permissions.unified?.accessLevel || 'none',
    isInGracePeriod: permissions.isExpired && !permissions.isBlocked,
    isTrialExpired: permissions.isExpired,
    
    // Missing methods
    canPerformAction: (action: string): boolean => {
      if (action === 'create') {
        return permissions.hasFullAccess || permissions.isSuperuser;
      }
      return permissions.hasFullAccess;
    },
    
    puedeCrear: (resource: string): PermissionResult => {
      return getPermissionForResource(resource);
    },
    
    canCreateViaje: {
      allowed: permissions.canCreateCartaPorte,
      reason: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason
    },
    
    // Resource-specific permission results (not just booleans)
    canCreateConductorResult: {
      allowed: permissions.canCreateConductor,
      reason: permissions.canCreateConductor ? 'Permitido' : permissions.accessReason
    },
    
    canCreateVehiculoResult: {
      allowed: permissions.canCreateVehiculo,
      reason: permissions.canCreateVehiculo ? 'Permitido' : permissions.accessReason
    },
    
    canCreateSocioResult: {
      allowed: permissions.canCreateSocio,
      reason: permissions.canCreateSocio ? 'Permitido' : permissions.accessReason
    },
    
    canCreateCartaPorteResult: {
      allowed: permissions.canCreateCartaPorte,
      reason: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason
    },
    
    // Utility method
    getPermissionForResource
  };
};

// Re-export for backward compatibility
export { usePermissions };
export type { PermissionResult };
