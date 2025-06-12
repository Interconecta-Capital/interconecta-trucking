
import { useSuscripcion } from './useSuscripcion';
import { useConductores } from './useConductores';
import { useVehiculos } from './useVehiculos';
import { useSocios } from './useSocios';
import { useCartasPorte } from './useCartasPorte';

export const usePermisosSubscripcion = () => {
  const { 
    suscripcion, 
    tienePermiso, 
    verificarLimite, 
    estaBloqueado,
    suscripcionVencida 
  } = useSuscripcion();
  
  const { conductores } = useConductores();
  const { vehiculos } = useVehiculos();
  const { socios } = useSocios();
  const { cartasPorte } = useCartasPorte();

  // Verificar si puede acceder a una funcionalidad
  const puedeAcceder = (funcionalidad: string): { puede: boolean; razon?: string } => {
    if (estaBloqueado) {
      return { 
        puede: false, 
        razon: 'Su cuenta está bloqueada por falta de pago' 
      };
    }

    if (suscripcionVencida()) {
      return { 
        puede: false, 
        razon: 'Su suscripción ha vencido' 
      };
    }

    switch (funcionalidad) {
      case 'cancelar_cfdi':
        return { 
          puede: tienePermiso('puede_cancelar_cfdi'),
          razon: !tienePermiso('puede_cancelar_cfdi') ? 'Esta función no está disponible en su plan actual' : undefined
        };
      
      case 'generar_xml':
        return { 
          puede: tienePermiso('puede_generar_xml'),
          razon: !tienePermiso('puede_generar_xml') ? 'Esta función no está disponible en su plan actual' : undefined
        };
      
      case 'timbrar':
        return { 
          puede: tienePermiso('puede_timbrar'),
          razon: !tienePermiso('puede_timbrar') ? 'Esta función no está disponible en su plan actual' : undefined
        };
      
      case 'tracking':
        return { 
          puede: tienePermiso('puede_tracking'),
          razon: !tienePermiso('puede_tracking') ? 'Esta función no está disponible en su plan actual' : undefined
        };
      
      default:
        return { puede: true };
    }
  };

  // Verificar si puede crear nuevos registros
  const puedeCrear = (tipo: 'conductores' | 'vehiculos' | 'socios' | 'cartas_porte'): { puede: boolean; razon?: string } => {
    if (estaBloqueado) {
      return { 
        puede: false, 
        razon: 'Su cuenta está bloqueada por falta de pago' 
      };
    }

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

  // Obtener límites del plan actual
  const obtenerLimites = () => {
    if (!suscripcion?.plan) return {};

    return {
      cartas_porte: suscripcion.plan.limite_cartas_porte,
      conductores: suscripcion.plan.limite_conductores,
      vehiculos: suscripcion.plan.limite_vehiculos,
      socios: suscripcion.plan.limite_socios,
    };
  };

  // Obtener uso actual vs límites
  const obtenerUsoActual = () => {
    return {
      cartas_porte: {
        usado: cartasPorte?.length || 0,
        limite: suscripcion?.plan?.limite_cartas_porte || null
      },
      conductores: {
        usado: conductores?.length || 0,
        limite: suscripcion?.plan?.limite_conductores || null
      },
      vehiculos: {
        usado: vehiculos?.length || 0,
        limite: suscripcion?.plan?.limite_vehiculos || null
      },
      socios: {
        usado: socios?.length || 0,
        limite: suscripcion?.plan?.limite_socios || null
      },
    };
  };

  return {
    puedeAcceder,
    puedeCrear,
    obtenerLimites,
    obtenerUsoActual,
    estaBloqueado,
    suscripcionVencida: suscripcionVencida(),
    planActual: suscripcion?.plan?.nombre || 'Sin plan',
  };
};
