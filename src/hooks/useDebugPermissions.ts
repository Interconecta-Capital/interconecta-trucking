
import { useEnhancedPermissions } from './useEnhancedPermissions';
import { useTrialManager } from './useTrialManager';
import { useAuth } from './useAuth';
import { useSuscripcion } from './useSuscripcion';

export const useDebugPermissions = () => {
  const { user } = useAuth();
  const { suscripcion, estaBloqueado } = useSuscripcion();
  const { 
    puedeCrear, 
    isSuperuser, 
    planActual,
    obtenerUsoActual 
  } = useEnhancedPermissions();
  const { 
    isInActiveTrial, 
    isInGracePeriod, 
    isTrialExpired, 
    hasFullAccess,
    canPerformAction 
  } = useTrialManager();

  const debugInfo = {
    user: {
      id: user?.id,
      email: user?.email
    },
    subscription: {
      status: suscripcion?.status,
      planActual,
      estaBloqueado,
      fechaFinPrueba: suscripcion?.fecha_fin_prueba,
      gracePeriodEnd: suscripcion?.grace_period_end
    },
    trial: {
      isInActiveTrial,
      isInGracePeriod,
      isTrialExpired,
      hasFullAccess,
      canPerformCreate: canPerformAction('create')
    },
    permissions: {
      isSuperuser,
      puedeCrearVehiculos: puedeCrear('vehiculos'),
      puedeCrearConductores: puedeCrear('conductores'),
      puedeCrearSocios: puedeCrear('socios'),
      puedeCrearCartasPorte: puedeCrear('cartas_porte')
    },
    usage: obtenerUsoActual()
  };

  // Log completo del estado
  console.log('=== DEBUG PERMISSIONS ===', debugInfo);

  return debugInfo;
};
