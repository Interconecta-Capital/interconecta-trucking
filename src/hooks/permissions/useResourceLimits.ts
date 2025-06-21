
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
    try {
      console.log(`useResourceLimits: Checking puedeCrear for ${tipo}`);
      
      // Durante trial activo, sin límites
      if (isInActiveTrial) {
        console.log('useResourceLimits: Active trial - unlimited access');
        return { puede: true, razon: undefined };
      }

      // Durante período de gracia, solo lectura
      if (isInGracePeriod) {
        console.log('useResourceLimits: Grace period - read only');
        return { 
          puede: false, 
          razon: 'Durante el período de gracia no puede crear nuevos registros. Adquiera un plan para recuperar todas las funciones.' 
        };
      }

      if (estaBloqueado) {
        console.log('useResourceLimits: User blocked');
        return { 
          puede: false, 
          razon: 'Su cuenta está bloqueada por falta de pago' 
        };
      }

      if (isTrialExpired && !suscripcion?.plan) {
        console.log('useResourceLimits: Trial expired, no active plan');
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

      console.log(`useResourceLimits: Current count for ${tipo}: ${cantidad}`);

      // Si no hay suscripción pero tampoco está en trial, permitir creación como fallback
      if (!suscripcion?.plan) {
        console.log('useResourceLimits: No plan found, allowing as fallback');
        return { puede: true };
      }

      const puedeCrearPorLimite = verificarLimite(tipo, cantidad);
      console.log(`useResourceLimits: verificarLimite result: ${puedeCrearPorLimite}`);
      
      if (!puedeCrearPorLimite) {
        const limite = suscripcion?.plan?.[`limite_${tipo}`];
        return {
          puede: false,
          razon: `Ha alcanzado el límite de ${limite} ${tipo.replace('_', ' ')} para su plan actual`
        };
      }

      console.log(`useResourceLimits: Access granted for ${tipo}`);
      return { puede: true };
    } catch (error) {
      console.error('Error en puedeCrear:', error);
      // En caso de error, devolver true como fallback
      console.log('useResourceLimits: Error occurred, allowing as fallback');
      return { puede: true };
    }
  };

  const obtenerLimites = (): Limits => {
    try {
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
    } catch (error) {
      console.error('Error en obtenerLimites:', error);
      return {
        cartas_porte: null,
        conductores: null,
        vehiculos: null,
        socios: null,
      };
    }
  };

  const obtenerUsoActual = (): UsageData => {
    try {
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
    } catch (error) {
      console.error('Error en obtenerUsoActual:', error);
      // Fallback con límites nulos (sin restricciones)
      return {
        cartas_porte: { usado: 0, limite: null },
        conductores: { usado: 0, limite: null },
        vehiculos: { usado: 0, limite: null },
        socios: { usado: 0, limite: null },
      };
    }
  };

  return {
    puedeCrear,
    obtenerLimites,
    obtenerUsoActual
  };
};
