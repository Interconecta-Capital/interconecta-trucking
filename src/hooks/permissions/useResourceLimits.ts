
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { useConductores } from '@/hooks/useConductores';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useSocios } from '@/hooks/useSocios';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useTrialManager } from '@/hooks/useTrialManager';
import { ResourceType, PermissionResult, Limits, UsageData } from '@/types/permissions';

export const useResourceLimits = () => {
  const { suscripcion, verificarLimite, estaBloqueado } = useSuscripcion();
  const { conductores } = useConductores();
  const { vehiculos } = useVehiculos();
  const { socios } = useSocios();
  const { cartasPorte } = useCartasPorte();
  const { isInActiveTrial, isTrialExpired, isInGracePeriod } = useTrialManager();

  const puedeCrear = (tipo: ResourceType): PermissionResult => {
    // Durante trial activo, sin límites
    if (isInActiveTrial) {
      return { puede: true, razon: undefined };
    }

    // Durante período de gracia, solo lectura
    if (isInGracePeriod) {
      return { 
        puede: false, 
        razon: 'Durante el período de gracia no puede crear nuevos registros. Adquiera un plan para recuperar todas las funciones.' 
      };
    }

    if (estaBloqueado) {
      return { 
        puede: false, 
        razon: 'Su cuenta está bloqueada por falta de pago' 
      };
    }

    if (isTrialExpired && !suscripcion?.plan) {
      return {
        puede: false,
        razon: 'Su período de prueba ha vencido. Actualice su plan para continuar creando registros.'
      };
    }

    // Lógica existente para usuarios con plan pagado
    let cantidad = 0;
    switch (tipo) {
      case 'conductores':
        cantidad = conductores?.length || 0;
        break;
      case 'vehiculos':
        cantidad = vehiculos?.length || 0;
        break;
      case 'socios':
        cantidad = socios?.length || 0;
        break;
      case 'cartas_porte':
        cantidad = cartasPorte?.length || 0;
        break;
    }

    const puedeCrearPorLimite = verificarLimite(tipo, cantidad);
    
    if (!puedeCrearPorLimite) {
      const limite = suscripcion?.plan?.[`limite_${tipo}`];
      return {
        puede: false,
        razon: `Ha alcanzado el límite de ${limite} ${tipo.replace('_', ' ')} para su plan actual`
      };
    }

    return { puede: true };
  };

  const obtenerLimites = (): Limits => {
    // Durante trial activo, sin límites
    if (isInActiveTrial) {
      return {
        cartas_porte: null,
        conductores: null,
        vehiculos: null,
        socios: null,
      };
    }

    if (!suscripcion?.plan) return {
      cartas_porte: null,
      conductores: null,
      vehiculos: null,
      socios: null,
    };

    return {
      cartas_porte: suscripcion.plan.limite_cartas_porte,
      conductores: suscripcion.plan.limite_conductores,
      vehiculos: suscripcion.plan.limite_vehiculos,
      socios: suscripcion.plan.limite_socios,
    };
  };

  const obtenerUsoActual = (): UsageData => {
    const limites = obtenerLimites();
    
    return {
      cartas_porte: {
        usado: cartasPorte?.length || 0,
        limite: limites.cartas_porte || null
      },
      conductores: {
        usado: conductores?.length || 0,
        limite: limites.conductores || null
      },
      vehiculos: {
        usado: vehiculos?.length || 0,
        limite: limites.vehiculos || null
      },
      socios: {
        usado: socios?.length || 0,
        limite: limites.socios || null
      },
    };
  };

  return {
    puedeCrear,
    obtenerLimites,
    obtenerUsoActual
  };
};
