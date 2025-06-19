
import { UbicacionCompleta } from '@/types/cartaPorte';

// Simplificamos los convertidores para trabajar solo con UbicacionCompleta
export const createDefaultUbicacion = (tipo: 'Origen' | 'Destino' | 'Paso Intermedio' = 'Origen'): UbicacionCompleta => {
  return {
    id: crypto.randomUUID(),
    tipo_ubicacion: tipo,
    id_ubicacion: '',
    distancia_recorrida: 0,
    tipo_estacion: '01',
    domicilio: {
      pais: 'MEX',
      codigo_postal: '',
      estado: '',
      municipio: '',
      colonia: '',
      calle: '',
      numero_exterior: ''
    }
  };
};

// Validar que una ubicación tenga los campos mínimos requeridos
export const validateUbicacion = (ubicacion: UbicacionCompleta): boolean => {
  return !!(
    ubicacion.tipo_ubicacion &&
    ubicacion.tipo_estacion &&
    ubicacion.domicilio?.codigo_postal &&
    ubicacion.domicilio?.municipio
  );
};

// Clonar una ubicación para edición
export const cloneUbicacion = (ubicacion: UbicacionCompleta): UbicacionCompleta => {
  return JSON.parse(JSON.stringify(ubicacion));
};
