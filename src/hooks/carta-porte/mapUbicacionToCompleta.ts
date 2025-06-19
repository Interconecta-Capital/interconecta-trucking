
import { Ubicacion } from '@/types/ubicaciones';
import { UbicacionCompleta } from '@/types/cartaPorte';

export const mapUbicacionToCompleta = (ubicacion: Ubicacion, cartaPorteId?: string): UbicacionCompleta => {
  return {
    id: ubicacion.id,
    tipo_ubicacion: ubicacion.tipoUbicacion,
    id_ubicacion: ubicacion.idUbicacion || ubicacion.id,
    distancia_recorrida: ubicacion.distanciaRecorrida || 0,
    tipo_estacion: ubicacion.tipoEstacion || '1', // Default value
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
      localidad: ubicacion.domicilio.localidad
    },
    carta_porte_id: cartaPorteId,
    rfc_remitente_destinatario: ubicacion.rfcRemitenteDestinatario,
    nombre_remitente_destinatario: ubicacion.nombreRemitenteDestinatario,
    fecha_hora_salida_llegada: ubicacion.fechaHoraSalidaLlegada,
    numero_estacion: ubicacion.numeroEstacion,
    kilometro: ubicacion.kilometro,
    coordenadas: ubicacion.coordenadas
  };
};
