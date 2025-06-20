
import { Badge } from '@/components/ui/badge';
import { useTimezoneAwareTrialTracking } from '@/hooks/useTimezoneAwareTrialTracking';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { Calendar, Clock } from 'lucide-react';

export function PlanBadge() {
  const { trialInfo, loading: trialLoading } = useTimezoneAwareTrialTracking();
  const { suscripcion, loading: subLoading } = useSuscripcion();

  const loading = trialLoading || subLoading;

  if (loading) {
    return (
      <Badge variant="secondary" className="animate-pulse">
        <Clock className="h-3 w-3 mr-1" />
        Cargando...
      </Badge>
    );
  }

  // Si está en período de prueba, mostrar "Prueba" con días reales
  if (trialInfo.isTrialActive || suscripcion?.status === 'trial') {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
        <Calendar className="h-3 w-3 mr-1" />
        Prueba: {trialInfo.daysRemaining} días restantes
      </Badge>
    );
  }

  // Si el trial expiró
  if (trialInfo.isTrialExpired && !trialInfo.hasValidSubscription) {
    return (
      <Badge variant="destructive">
        <Calendar className="h-3 w-3 mr-1" />
        Prueba Expirada
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

  // Por defecto mostrar el plan actual o Básico si no hay información
  const planName = suscripcion?.plan?.nombre || 'Plan Básico';
  return (
    <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
      {planName}
    </Badge>
  );
}
