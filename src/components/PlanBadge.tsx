
import { Badge } from '@/components/ui/badge';
import { useTrialTracking } from '@/hooks/useTrialTracking';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { Calendar, Clock } from 'lucide-react';

export function PlanBadge() {
  const { trialInfo, loading } = useTrialTracking();
  const { enPeriodoPrueba } = useSuscripcion();

  if (loading) {
    return (
      <Badge variant="secondary" className="animate-pulse">
        <Clock className="h-3 w-3 mr-1" />
        Cargando...
      </Badge>
    );
  }

  if (trialInfo.isTrialExpired) {
    return (
      <Badge variant="destructive">
        <Calendar className="h-3 w-3 mr-1" />
        Trial Expirado
      </Badge>
    );
  }

  if (trialInfo.isTrialActive || enPeriodoPrueba()) {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
        <Calendar className="h-3 w-3 mr-1" />
        Trial: {trialInfo.daysRemaining} días restantes
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
      Plan Premium
    </Badge>
  );
}
