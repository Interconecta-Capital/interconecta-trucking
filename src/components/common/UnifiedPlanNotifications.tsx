
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  TrendingUp 
} from 'lucide-react';
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';

export function UnifiedPlanNotifications() {
  const permissions = useUnifiedPermissions();

  // No mostrar nada para superusuarios
  if (permissions.accessLevel === 'superuser') {
    return null;
  }

  // Trial activo
  if (permissions.accessLevel === 'trial') {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong className="text-blue-900">Período de prueba activo</strong>
            <div className="text-blue-700 text-sm mt-1">
              {permissions.accessReason} • Acceso completo a todas las funciones
            </div>
          </div>
          <Button size="sm" variant="outline" asChild>
            <a href="/planes" className="text-blue-600 border-blue-300 hover:bg-blue-100">
              Ver Planes
            </a>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Plan pagado activo
  if (permissions.accessLevel === 'paid') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong className="text-green-900">{permissions.planInfo.name}</strong>
          <div className="text-green-700 text-sm mt-1">
            Plan activo • {permissions.accessReason}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Cuenta bloqueada
  if (permissions.accessLevel === 'blocked') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong className="text-red-900">Cuenta bloqueada</strong>
            <div className="text-red-700 text-sm mt-1">
              {permissions.accessReason}
            </div>
          </div>
          <Button size="sm" variant="outline" asChild>
            <a href="/planes" className="text-red-600 border-red-300 hover:bg-red-100">
              Reactivar Cuenta
            </a>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial expirado o sin plan
  if (permissions.accessLevel === 'expired') {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong className="text-orange-900">
              {permissions.planInfo.name === 'Período de Gracia' ? 
                'Período de gracia activo' : 
                'Período de prueba finalizado'
              }
            </strong>
            <div className="text-orange-700 text-sm mt-1">
              {permissions.accessReason} • Funciones limitadas a solo lectura
            </div>
          </div>
          <Button size="sm" asChild>
            <a href="/planes" className="bg-orange-600 hover:bg-orange-700">
              <TrendingUp className="h-4 w-4 mr-1" />
              Activar Plan
            </a>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
