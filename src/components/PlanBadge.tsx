
import { Badge } from '@/components/ui/badge';
import { useTrialTracking } from '@/hooks/useTrialTracking';
import { Calendar, Clock } from 'lucide-react';

export function PlanBadge() {
  const { trialInfo, loading } = useTrialTracking();

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

  if (trialInfo.isTrialActive) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
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
