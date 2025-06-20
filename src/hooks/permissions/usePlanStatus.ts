
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { useTrialManager } from '@/hooks/useTrialManager';

export const usePlanStatus = () => {
  const { suscripcion } = useSuscripcion();
  const { isInActiveTrial, isInGracePeriod, isTrialExpired } = useTrialManager();

  const getPlanActual = (): string => {
    if (isInActiveTrial) {
      return 'Trial Completo (14 días)';
    }
    
    if (isInGracePeriod) {
      return 'Período de Gracia (Solo Lectura)';
    }
    
    if (isTrialExpired && !suscripcion?.plan) {
      return 'Sin Plan';
    }
    
    return suscripcion?.plan?.nombre || 'Sin plan';
  };

  return {
    getPlanActual
  };
};
