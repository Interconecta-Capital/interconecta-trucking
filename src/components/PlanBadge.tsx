
import { Badge } from '@/components/ui/badge';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { Clock, Crown, Zap } from 'lucide-react';

export function PlanBadge() {
  const { suscripcion, enPeriodoPrueba, diasRestantesPrueba } = useSuscripcion();

  if (!suscripcion) return null;

  const getPlanIcon = () => {
    if (enPeriodoPrueba()) return <Clock className="h-3 w-3 mr-1" />;
    
    switch (suscripcion.plan?.nombre) {
      case 'Básico':
        return <Zap className="h-3 w-3 mr-1" />;
      case 'Profesional':
        return <Crown className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getPlanText = () => {
    if (enPeriodoPrueba()) {
      const dias = diasRestantesPrueba();
      return `Prueba (${dias}d)`;
    }
    return suscripcion.plan?.nombre || 'Plan';
  };

  const getBadgeVariant = () => {
    if (enPeriodoPrueba()) return 'secondary';
    
    switch (suscripcion.plan?.nombre) {
      case 'Básico':
        return 'outline';
      case 'Profesional':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getBadgeVariant()} className="flex items-center">
      {getPlanIcon()}
      {getPlanText()}
    </Badge>
  );
}
