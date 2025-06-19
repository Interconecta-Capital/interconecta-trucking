
import { Ubicacion } from '@/types/ubicaciones';
import { UbicacionCompleta } from '@/types/cartaPorte';

/**
 * Convierte una ubicación del formato usado en los formularios
 * al formato completo requerido por el generador de XML/PDF.
 */
export function mapUbicacionToCompleta(ubicacion: Ubicacion): UbicacionCompleta {
  return {
    id: ubicacion.id,
    tipo_ubicacion: ubicacion.tipoUbicacion,
    id_ubicacion: ubicacion.idUbicacion,
    rfc_remitente_destinatario: ubicacion.rfcRemitenteDestinatario,
    nombre_remitente_destinatario: ubicacion.nombreRemitenteDestinatario,
    fecha_hora_salida_llegada: ubicacion.fechaHoraSalidaLlegada,
    distancia_recorrida: ubicacion.distanciaRecorrida,
    tipo_estacion: (ubicacion as any).tipoEstacion,
    numero_estacion: (ubicacion as any).numeroEstacion,
    kilometro: (ubicacion as any).kilometro,
    coordenadas: ubicacion.coordenadas
      ? {
          latitud: ubicacion.coordenadas.latitud ?? 0,
          longitud: ubicacion.coordenadas.longitud ?? 0,
        }
      : undefined,
    domicilio: {
      pais: ubicacion.domicilio.pais,
      codigo_postal: ubicacion.domicilio.codigoPostal,
      estado: ubicacion.domicilio.estado,
      municipio: ubicacion.domicilio.municipio,
      colonia: ubicacion.domicilio.colonia,
      calle: ubicacion.domicilio.calle,
      numero_exterior: ubicacion.domicilio.numExterior || '',
      numero_interior: ubicacion.domicilio.numInterior,
      referencia: ubicacion.domicilio.referencia,
    },
  };
}
