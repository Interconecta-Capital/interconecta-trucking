
import { useSuscripcion } from '../useSuscripcion';
import { useSuperuser } from '../useSuperuser';

export const usePlanStatus = () => {
  const { suscripcion, planes } = useSuscripcion();
  const { isSuperuser } = useSuperuser();

  const getPlanActual = () => {
    if (isSuperuser) {
      return {
        nombre: 'Superuser',
        descripcion: 'Acceso completo del sistema',
        precio_mensual: 0,
        limite_cartas_porte: null,
        limite_conductores: null,
        limite_vehiculos: null,
        limite_socios: null,
        puede_cancelar_cfdi: true,
        puede_generar_xml: true,
        puede_timbrar: true,
        puede_tracking: true,
        puede_acceder_administracion: true,
        puede_acceder_funciones_avanzadas: true,
        puede_acceder_enterprise: true,
        activo: true
      };
    }

    if (!suscripcion?.plan) {
      // Plan básico por defecto - Handle case where planes might be undefined
      const planBasico = Array.isArray(planes) ? planes.find(p => p?.nombre?.toLowerCase() === 'básico') : null;
      
      return planBasico || {
        nombre: 'Trial',
        descripcion: 'Período de prueba',
        precio_mensual: 0,
        limite_cartas_porte: 5,
        limite_conductores: 2,
        limite_vehiculos: 2,
        limite_socios: 5,
        puede_cancelar_cfdi: false,
        puede_generar_xml: true,
        puede_timbrar: false,
        puede_tracking: false,
        puede_acceder_administracion: false,
        puede_acceder_funciones_avanzadas: false,
        puede_acceder_enterprise: false,
        activo: true
      };
    }

    return suscripcion.plan;
  };

  return {
    getPlanActual,
    planActual: getPlanActual(),
    isSuperuser
  };
};
