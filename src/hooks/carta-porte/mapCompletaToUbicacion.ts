
import { Ubicacion } from '@/types/ubicaciones';
import { UbicacionCompleta } from '@/types/cartaPorte';

/**
 * Convierte una ubicación del formato completo (snake_case de BD)
 * al formato usado internamente por los formularios (camelCase).
 * Actualizado para manejar los nuevos campos de la migración.
 */
export function mapCompletaToUbicacion(ubicacion: UbicacionCompleta): Ubicacion {
  return {
    id: ubicacion.id,
    idUbicacion: ubicacion.id_ubicacion || ubicacion.id,
    tipoUbicacion: ubicacion.tipo_ubicacion,
    rfcRemitenteDestinatario: ubicacion.rfc_remitente_destinatario,
    nombreRemitenteDestinatario: ubicacion.nombre_remitente_destinatario,
    fechaHoraSalidaLlegada: ubicacion.fecha_hora_salida_llegada,
    distanciaRecorrida: ubicacion.distancia_recorrida,
    ordenSecuencia: 1, // Se calcula en el frontend según el orden
    
    // Coordenadas con validación de tipos
    coordenadas: ubicacion.coordenadas
      ? {
          latitud: Number(ubicacion.coordenadas.latitud) || 0,
          longitud: Number(ubicacion.coordenadas.longitud) || 0,
        }
      : undefined,
    
    // Domicilio con conversión de nomenclatura
    domicilio: {
      pais: ubicacion.domicilio.pais || 'MEX',
      codigoPostal: ubicacion.domicilio.codigo_postal || '',
      estado: ubicacion.domicilio.estado || '',
      municipio: ubicacion.domicilio.municipio || '',
      colonia: ubicacion.domicilio.colonia || '',
      calle: ubicacion.domicilio.calle || '',
      numExterior: ubicacion.domicilio.numero_exterior || '',
      numInterior: ubicacion.domicilio.numero_interior,
      referencia: ubicacion.domicilio.referencia,
      localidad: '', // Campo del frontend que no existe en BD
    },
    
    // Campos nuevos de la migración (opcionales en el frontend)
    tipoEstacion: ubicacion.tipo_estacion,
    numeroEstacion: ubicacion.numero_estacion,
    kilometro: ubicacion.kilometro,
  };
}

/**
 * Función helper para convertir múltiples ubicaciones
 */
export function mapMultiplesCompletasToUbicaciones(ubicaciones: UbicacionCompleta[]): Ubicacion[] {
  return ubicaciones.map((ubicacion, index) => ({
    ...mapCompletaToUbicacion(ubicacion),
    ordenSecuencia: index + 1, // Asignar orden basado en posición
  }));
}

/**
 * Función para validar la consistencia de datos después de la conversión
 */
export function validateUbicacionConversion(
  original: UbicacionCompleta, 
  converted: Ubicacion
): boolean {
  return (
    original.id === converted.id &&
    original.tipo_ubicacion === converted.tipoUbicacion &&
    original.domicilio.codigo_postal === converted.domicilio.codigoPostal &&
    original.domicilio.estado === converted.domicilio.estado
  );
}
