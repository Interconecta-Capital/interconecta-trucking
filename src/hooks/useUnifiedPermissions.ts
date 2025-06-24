
import { usePermissions } from './usePermissions';

export interface PermissionResult {
  allowed: boolean;
  reason: string;
  limit?: number;
  used?: number;
  // Spanish compatibility properties
  puede: boolean;
  razon: string;
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
        const conductorResult = {
          allowed: permissions.canCreateConductor,
          reason: permissions.canCreateConductor ? 'Permitido' : permissions.accessReason,
          puede: permissions.canCreateConductor,
          razon: permissions.canCreateConductor ? 'Permitido' : permissions.accessReason
        };
        return conductorResult;
      case 'vehiculos':
        const vehiculoResult = {
          allowed: permissions.canCreateVehiculo,
          reason: permissions.canCreateVehiculo ? 'Permitido' : permissions.accessReason,
          puede: permissions.canCreateVehiculo,
          razon: permissions.canCreateVehiculo ? 'Permitido' : permissions.accessReason
        };
        return vehiculoResult;
      case 'socios':
        const socioResult = {
          allowed: permissions.canCreateSocio,
          reason: permissions.canCreateSocio ? 'Permitido' : permissions.accessReason,
          puede: permissions.canCreateSocio,
          razon: permissions.canCreateSocio ? 'Permitido' : permissions.accessReason
        };
        return socioResult;
      case 'cartas_porte':
        const cartaResult = {
          allowed: permissions.canCreateCartaPorte,
          reason: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason,
          puede: permissions.canCreateCartaPorte,
          razon: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason
        };
        return cartaResult;
      case 'viajes':
        const viajeResult = {
          allowed: permissions.canCreateCartaPorte, // Viajes depend on carta porte creation
          reason: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason,
          puede: permissions.canCreateCartaPorte,
          razon: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason
        };
        return viajeResult;
      default:
        return {
          allowed: false,
          reason: 'Recurso no reconocido',
          puede: false,
          razon: 'Recurso no reconocido'
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
      reason: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason,
      puede: permissions.canCreateCartaPorte,
      razon: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason
    },
    
    // Resource-specific permission results (not just booleans)
    canCreateConductorResult: {
      allowed: permissions.canCreateConductor,
      reason: permissions.canCreateConductor ? 'Permitido' : permissions.accessReason,
      puede: permissions.canCreateConductor,
      razon: permissions.canCreateConductor ? 'Permitido' : permissions.accessReason
    },
    
    canCreateVehiculoResult: {
      allowed: permissions.canCreateVehiculo,
      reason: permissions.canCreateVehiculo ? 'Permitido' : permissions.accessReason,
      puede: permissions.canCreateVehiculo,
      razon: permissions.canCreateVehiculo ? 'Permitido' : permissions.accessReason
    },
    
    canCreateSocioResult: {
      allowed: permissions.canCreateSocio,
      reason: permissions.canCreateSocio ? 'Permitido' : permissions.accessReason,
      puede: permissions.canCreateSocio,
      razon: permissions.canCreateSocio ? 'Permitido' : permissions.accessReason
    },
    
    canCreateCartaPorteResult: {
      allowed: permissions.canCreateCartaPorte,
      reason: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason,
      puede: permissions.canCreateCartaPorte,
      razon: permissions.canCreateCartaPorte ? 'Permitido' : permissions.accessReason
    },
    
    // Utility method
    getPermissionForResource
  };
};

// Re-export for backward compatibility
export { usePermissions };
