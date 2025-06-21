
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Lock, Clock, AlertTriangle } from 'lucide-react';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';

interface ProtectedActionsV2Props {
  resource: 'conductores' | 'vehiculos' | 'socios' | 'cartas_porte' | 'remolques';
  onAction: () => void;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  showReason?: boolean;
}

/**
 * Componente de Acciones Protegidas V2 - SOLO PARA TESTING FASE 2
 * 
 * Este componente utiliza el nuevo hook useUnifiedPermissionsV2
 * y está diseñado para reemplazar gradualmente ProtectedActions
 * en la Fase 2 del plan de estabilización.
 */
export function ProtectedActionsV2({
  resource,
  onAction,
  buttonText,
  variant = 'default',
  size = 'default',
  showReason = true
}: ProtectedActionsV2Props) {
  const permissions = useUnifiedPermissionsV2();
  
  console.log('[ProtectedActionsV2] 🔍 Evaluando permisos para recurso:', resource);
  
  // Mapear recursos a permisos específicos
  const getPermissionForResource = () => {
    switch (resource) {
      case 'conductores':
        return permissions.canCreateConductor;
      case 'vehiculos':
        return permissions.canCreateVehiculo;
      case 'socios':
        return permissions.canCreateSocio;
      case 'cartas_porte':
        return permissions.canCreateCartaPorte;
      case 'remolques':
        return permissions.canCreateRemolque;
      default:
        return { allowed: false, reason: 'Recurso no reconocido' };
    }
  };

  const permission = getPermissionForResource();
  const defaultButtonText = buttonText || `Nuevo ${resource.slice(0, -1)}`;

  console.log('[ProtectedActionsV2] 📊 Permiso evaluado:', {
    resource,
    allowed: permission.allowed,
    reason: permission.reason,
    accessLevel: permissions.accessLevel
  });

  // Si tiene permiso, mostrar botón activo
  if (permission.allowed) {
    return (
      <div className="space-y-2">
        <Button
          variant={variant}
          size={size}
          onClick={onAction}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {defaultButtonText}
        </Button>
        
        {showReason && permission.reason && permissions.accessLevel !== 'superuser' && (
          <p className="text-xs text-muted-foreground">
            {permission.reason}
          </p>
        )}
      </div>
    );
  }

  // Si no tiene permiso, mostrar estado bloqueado
  const getBlockedIcon = () => {
    switch (permissions.accessLevel) {
      case 'blocked': return Lock;
      case 'expired': return Clock;
      default: return AlertTriangle;
    }
  };

  const BlockedIcon = getBlockedIcon();

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size={size}
        disabled
        className="flex items-center gap-2 opacity-50"
      >
        <BlockedIcon className="h-4 w-4" />
        {defaultButtonText}
      </Button>
      
      {showReason && (
        <div className={`text-xs p-2 rounded ${
          permissions.accessLevel === 'blocked' ? 'bg-red-50 text-red-700' :
          permissions.accessLevel === 'expired' ? 'bg-orange-50 text-orange-700' :
          'bg-yellow-50 text-yellow-700'
        }`}>
          <strong>Acceso limitado:</strong> {permission.reason}
          {permissions.accessLevel === 'expired' && (
            <div className="mt-1">
              <a href="/planes" className="underline">
                Ver planes disponibles →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
