
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { Calendar, Clock, AlertCircle, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MobileTrialInfo() {
  const permissions = useUnifiedPermissionsV2();

  // No mostrar información para superusuarios
  if (permissions.accessLevel === 'superuser') {
    return (
      <div className="px-3 py-3 border-t bg-yellow-50/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Modo Superuser</span>
          </div>
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
            Acceso Total
          </Badge>
        </div>
      </div>
    );
  }

  // Trial activo
  if (permissions.accessLevel === 'trial') {
    const daysRemaining = permissions.planInfo.daysRemaining || 0;
    const daysUsed = permissions.planInfo.daysUsed || 0;
    const totalDays = permissions.planInfo.totalTrialDays || 14;
    const progressPercentage = (daysUsed / totalDays) * 100;
    
    return (
      <div className="px-3 py-3 border-t bg-orange-50/50">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Período de Prueba</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-orange-700">
              <span>Días utilizados</span>
              <span className="font-medium">{daysUsed} / {totalDays}</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-orange-700">
            <Clock className="h-3 w-3" />
            <span>
              {daysRemaining === 0 
                ? 'Último día de prueba'
                : `${daysRemaining} días restantes`
              }
            </span>
          </div>

          {daysRemaining <= 3 && (
            <Link to="/planes" className="block">
              <Button size="sm" className="w-full text-xs">
                Actualizar Plan
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Plan expirado o bloqueado
  if (permissions.accessLevel === 'expired' || permissions.accessLevel === 'blocked') {
    return (
      <div className="px-3 py-3 border-t bg-red-50/50">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              {permissions.accessLevel === 'blocked' ? 'Cuenta Bloqueada' : 'Plan Expirado'}
            </span>
          </div>
          <p className="text-xs text-red-700">
            {permissions.accessReason}
          </p>
          <Link to="/planes" className="block">
            <Button size="sm" className="w-full text-xs">
              {permissions.accessLevel === 'blocked' ? 'Reactivar Cuenta' : 'Ver Planes'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Plan activo
  if (permissions.accessLevel === 'paid') {
    return (
      <div className="px-3 py-3 border-t bg-green-50/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Plan Actual</span>
          </div>
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
            {permissions.planInfo.name}
          </Badge>
          <Link to="/planes" className="block">
            <Button size="sm" variant="outline" className="w-full text-xs">
              Gestionar Plan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
