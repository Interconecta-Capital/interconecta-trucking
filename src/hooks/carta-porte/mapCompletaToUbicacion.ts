
import { Ubicacion } from '@/types/ubicaciones';
import { UbicacionCompleta } from '@/types/cartaPorte';

/**
 * Convierte una ubicación del formato completo (snake_case)
 * al formato usado internamente por los formularios (camelCase).
 */
export function mapCompletaToUbicacion(ubicacion: UbicacionCompleta): Ubicacion {
  return {
    id: ubicacion.id,
    idUbicacion: ubicacion.id_ubicacion || ubicacion.id,
    tipoUbicacion: ubicacion.tipo_ubicacion as 'Origen' | 'Destino' | 'Paso Intermedio',
    rfcRemitenteDestinatario: ubicacion.rfc_remitente_destinatario,
    nombreRemitenteDestinatario: ubicacion.nombre_remitente_destinatario,
    fechaHoraSalidaLlegada: ubicacion.fecha_hora_salida_llegada,
    distanciaRecorrida: ubicacion.distancia_recorrida,
    ordenSecuencia: (ubicacion as any).orden_secuencia || 1,
    coordenadas: ubicacion.coordenadas
      ? {
          latitud: ubicacion.coordenadas.latitud || 0,
          longitud: ubicacion.coordenadas.longitud || 0,
        }
      : undefined,
    domicilio: {
      pais: ubicacion.domicilio.pais,
      codigoPostal: ubicacion.domicilio.codigo_postal,
      estado: ubicacion.domicilio.estado,
      municipio: ubicacion.domicilio.municipio,
      colonia: ubicacion.domicilio.colonia,
      calle: ubicacion.domicilio.calle,
      numExterior: ubicacion.domicilio.numero_exterior,
      numInterior: ubicacion.domicilio.numero_interior,
      referencia: ubicacion.domicilio.referencia,
      localidad: (ubicacion.domicilio as any).localidad || '',
    },
  };
}
