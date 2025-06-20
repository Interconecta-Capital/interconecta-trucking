
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTimezoneAwareTrialTracking } from '@/hooks/useTimezoneAwareTrialTracking';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { Calendar, Clock, AlertCircle, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MobileTrialInfo() {
  const { trialInfo, loading } = useTimezoneAwareTrialTracking();
  const { suscripcion, enPeriodoPrueba } = useSuscripcion();

  if (loading) {
    return (
      <div className="px-3 py-2 border-t">
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Si está en período de prueba, mostrar información de trial
  if (trialInfo.isTrialActive || enPeriodoPrueba() || suscripcion?.status === 'trial') {
    const progressPercentage = (trialInfo.daysUsed / trialInfo.totalTrialDays) * 100;
    
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
              <span className="font-medium">{trialInfo.daysUsed} / {trialInfo.totalTrialDays}</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-orange-700">
            <Clock className="h-3 w-3" />
            <span>
              {trialInfo.daysRemaining === 0 
                ? 'Último día de prueba'
                : `${trialInfo.daysRemaining} días restantes`
              }
            </span>
          </div>

          {trialInfo.daysRemaining <= 3 && (
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

  // Si el trial expiró
  if (trialInfo.isTrialExpired) {
    return (
      <div className="px-3 py-3 border-t bg-red-50/50">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Trial Expirado</span>
          </div>
          <p className="text-xs text-red-700">
            Tu período de prueba ha expirado. Actualiza tu plan para continuar.
          </p>
          <Link to="/planes" className="block">
            <Button size="sm" className="w-full text-xs">
              Ver Planes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Si tiene suscripción activa, mostrar el plan actual
  if (suscripcion?.status === 'active' && suscripcion.plan) {
    return (
      <div className="px-3 py-3 border-t bg-green-50/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Plan Actual</span>
          </div>
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
            {suscripcion.plan.nombre}
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
