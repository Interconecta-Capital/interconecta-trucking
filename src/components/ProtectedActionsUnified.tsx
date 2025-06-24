
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, Lock, Clock } from 'lucide-react';
import { useUnifiedPermissions, PermissionResult } from '@/hooks/useUnifiedPermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtectedActionsUnifiedProps {
  action: 'create';
  resource: 'conductores' | 'vehiculos' | 'socios' | 'cartas_porte' | 'viajes';
  onAction: () => void;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  showReason?: boolean;
}

export function ProtectedActionsUnified({
  action,
  resource,
  onAction,
  buttonText,
  variant = 'default',
  size = 'default',
  showReason = true
}: ProtectedActionsUnifiedProps) {
  const permissions = useUnifiedPermissions();
  
  // Mapear recursos a permisos específicos
  const getPermission = (): PermissionResult => {
    switch (resource) {
      case 'conductores':
        return permissions.canCreateConductorResult;
      case 'vehiculos':
        return permissions.canCreateVehiculoResult;
      case 'socios':
        return permissions.canCreateSocioResult;
      case 'cartas_porte':
        return permissions.canCreateCartaPorteResult;
      case 'viajes':
        return permissions.canCreateViaje;
      default:
        return { allowed: false, reason: 'Recurso no reconocido' };
    }
  };

  const permission = getPermission();
  const defaultButtonText = buttonText || `Nuevo ${resource.slice(0, -1)}`;

  // Si tiene permiso, mostrar botón normal
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
        
        {showReason && permission.reason && permissions.accessLevel === 'paid' && (
          <p className="text-xs text-muted-foreground">
            {permission.reason}
          </p>
        )}
      </div>
    );
  }

  // Si no tiene permiso, mostrar estado bloqueado
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size={size}
        disabled
        className="flex items-center gap-2 opacity-50"
      >
        {permissions.accessLevel === 'blocked' ? (
          <Lock className="h-4 w-4" />
        ) : permissions.accessLevel === 'expired' ? (
          <Clock className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        {defaultButtonText}
      </Button>
      
      {showReason && (
        <Alert className={`${
          permissions.accessLevel === 'blocked' ? 'border-red-200 bg-red-50' :
          permissions.accessLevel === 'expired' ? 'border-orange-200 bg-orange-50' :
          'border-yellow-200 bg-yellow-50'
        }`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Acceso limitado:</strong> {permission.reason}
            {permissions.accessLevel === 'expired' && (
              <div className="mt-1">
                <a href="/planes" className="text-blue-600 hover:underline">
                  Ver planes disponibles →
                </a>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
