
import { Badge } from '@/components/ui/badge';
import { useTrialTracking } from '@/hooks/useTrialTracking';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { Calendar, Clock } from 'lucide-react';

export function PlanBadge() {
  const { trialInfo, loading } = useTrialTracking();
  const { suscripcion, enPeriodoPrueba } = useSuscripcion();

  if (loading) {
    return (
      <Badge variant="secondary" className="animate-pulse">
        <Clock className="h-3 w-3 mr-1" />
        Cargando...
      </Badge>
    );
  }

  // Si está en período de prueba, mostrar "Trial"
  if (trialInfo.isTrialActive || enPeriodoPrueba()) {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
        <Calendar className="h-3 w-3 mr-1" />
        Trial: {trialInfo.daysRemaining} días restantes
      </Badge>
    );
  }

  // Si el trial expiró
  if (trialInfo.isTrialExpired) {
    return (
      <Badge variant="destructive">
        <Calendar className="h-3 w-3 mr-1" />
        Trial Expirado
      </Badge>
    );
  }

  // Si tiene suscripción activa, mostrar el nombre del plan
  if (suscripcion?.status === 'active' && suscripcion.plan) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        {suscripcion.plan.nombre}
      </Badge>
    );
  }

  // Por defecto mostrar Premium si no está en trial
  return (
    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
      Plan Premium
    </Badge>
  );
}
