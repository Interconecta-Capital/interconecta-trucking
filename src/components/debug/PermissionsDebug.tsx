
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';
import { useOptimizedSuperuser } from '@/hooks/useOptimizedSuperuser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PermissionsDebug() {
  const permissions = useUnifiedPermissions();
  const { isSuperuser } = useOptimizedSuperuser();

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Debug: Estado de Permisos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex gap-2">
          <Badge variant={isSuperuser ? "default" : "secondary"}>
            Superusuario: {isSuperuser ? "SÍ" : "NO"}
          </Badge>
          <Badge variant={permissions.accessLevel === 'superuser' ? "default" : "secondary"}>
            Access Level: {permissions.accessLevel}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Crear Conductores:</strong>
            <Badge variant={permissions.canCreateConductor.allowed ? "default" : "destructive"} className="ml-1 text-xs">
              {permissions.canCreateConductor.allowed ? "✅" : "❌"}
            </Badge>
          </div>
          <div>
            <strong>Crear Vehículos:</strong>
            <Badge variant={permissions.canCreateVehiculo.allowed ? "default" : "destructive"} className="ml-1 text-xs">
              {permissions.canCreateVehiculo.allowed ? "✅" : "❌"}
            </Badge>
          </div>
          <div>
            <strong>Crear Socios:</strong>
            <Badge variant={permissions.canCreateSocio.allowed ? "default" : "destructive"} className="ml-1 text-xs">
              {permissions.canCreateSocio.allowed ? "✅" : "❌"}
            </Badge>
          </div>
          <div>
            <strong>Crear Cartas:</strong>
            <Badge variant={permissions.canCreateCartaPorte.allowed ? "default" : "destructive"} className="ml-1 text-xs">
              {permissions.canCreateCartaPorte.allowed ? "✅" : "❌"}
            </Badge>
          </div>
        </div>
        
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <strong>Razón:</strong> {permissions.accessReason}
        </div>
      </CardContent>
    </Card>
  );
}
