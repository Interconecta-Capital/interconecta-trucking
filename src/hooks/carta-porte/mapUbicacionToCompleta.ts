
import { Ubicacion } from '@/types/ubicaciones';
import { UbicacionCompleta } from '@/types/cartaPorte';

/**
 * Convierte una ubicación del formato usado en los formularios
 * al formato completo requerido por el generador de XML/PDF.
 * Actualizado para ser coherente con la nueva estructura de BD.
 */
export function mapUbicacionToCompleta(ubicacion: Ubicacion): UbicacionCompleta {
  return {
    id: ubicacion.id,
    tipo_ubicacion: ubicacion.tipoUbicacion as 'Origen' | 'Destino' | 'Paso Intermedio',
    id_ubicacion: ubicacion.idUbicacion || ubicacion.id,
    rfc_remitente_destinatario: ubicacion.rfcRemitenteDestinatario,
    nombre_remitente_destinatario: ubicacion.nombreRemitenteDestinatario,
    fecha_hora_salida_llegada: ubicacion.fechaHoraSalidaLlegada,
    distancia_recorrida: ubicacion.distanciaRecorrida,
    
    // Campos nuevos agregados en la migración de BD
    tipo_estacion: (ubicacion as any).tipoEstacion,
    numero_estacion: (ubicacion as any).numeroEstacion,
    kilometro: (ubicacion as any).kilometro,
    
    // Coordenadas con estructura validada
    coordenadas: ubicacion.coordenadas
      ? {
          latitud: Number(ubicacion.coordenadas.latitud) || 0,
          longitud: Number(ubicacion.coordenadas.longitud) || 0,
        }
      : undefined,
    
    // Domicilio con estructura completa
    domicilio: {
      pais: ubicacion.domicilio.pais || 'MEX',
      codigo_postal: ubicacion.domicilio.codigoPostal || '',
      estado: ubicacion.domicilio.estado || '',
      municipio: ubicacion.domicilio.municipio || '',
      colonia: ubicacion.domicilio.colonia || '',
      calle: ubicacion.domicilio.calle || '',
      numero_exterior: ubicacion.domicilio.numExterior || '',
      numero_interior: ubicacion.domicilio.numInterior,
      referencia: ubicacion.domicilio.referencia,
    },
  };
}

/**
 * Función helper para validar que una ubicación tiene todos los campos requeridos
 */
export function validateUbicacionCompleta(ubicacion: UbicacionCompleta): string[] {
  const errors: string[] = [];
  
  if (!ubicacion.tipo_ubicacion) {
    errors.push('Tipo de ubicación es requerido');
  }
  
  if (!ubicacion.id_ubicacion) {
    errors.push('ID de ubicación es requerido');
  }
  
  if (!ubicacion.domicilio.codigo_postal) {
    errors.push('Código postal es requerido');
  }
  
  if (!ubicacion.domicilio.estado) {
    errors.push('Estado es requerido');
  }
  
  if (!ubicacion.domicilio.municipio) {
    errors.push('Municipio es requerido');
  }
  
  // Validación específica para destinos
  if (ubicacion.tipo_ubicacion === 'Destino' && !ubicacion.distancia_recorrida) {
    errors.push('Distancia recorrida es requerida para destinos');
  }
  
  return errors;
}

/**
 * Función para crear una ubicación por defecto
 */
export function createDefaultUbicacion(tipo: 'Origen' | 'Destino' | 'Paso Intermedio'): UbicacionCompleta {
  return {
    id: `ubicacion-${Date.now()}`,
    tipo_ubicacion: tipo,
    id_ubicacion: `ID${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    distancia_recorrida: tipo === 'Origen' ? 0 : undefined,
    domicilio: {
      pais: 'MEX',
      codigo_postal: '',
      estado: '',
      municipio: '',
      colonia: '',
      calle: '',
      numero_exterior: '',
    },
  };
}
