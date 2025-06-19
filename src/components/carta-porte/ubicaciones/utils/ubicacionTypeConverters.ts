
import { Ubicacion } from '@/types/ubicaciones';
import { UbicacionCompleta } from '@/types/cartaPorte';

// Helper function to convert Ubicacion to UbicacionCompleta
export const convertToUbicacionCompleta = (ubicacion: Ubicacion): UbicacionCompleta => {
  return {
    id: ubicacion.id,
    tipo_ubicacion: ubicacion.tipoUbicacion,
    id_ubicacion: ubicacion.idUbicacion || ubicacion.id,
    distancia_recorrida: ubicacion.distanciaRecorrida || 0,
    tipo_estacion: ubicacion.tipoEstacion || '1', // Required property with default value
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
    rfc_remitente_destinatario: ubicacion.rfcRemitenteDestinatario,
    nombre_remitente_destinatario: ubicacion.nombreRemitenteDestinatario,
    fecha_hora_salida_llegada: ubicacion.fechaHoraSalidaLlegada,
    numero_estacion: ubicacion.numeroEstacion,
    kilometro: ubicacion.kilometro,
    coordenadas: ubicacion.coordenadas
  };
};

// Helper function to convert UbicacionCompleta to Ubicacion
export const convertToUbicacion = (ubicacionCompleta: UbicacionCompleta): Ubicacion => {
  return {
    id: ubicacionCompleta.id || crypto.randomUUID(),
    idUbicacion: ubicacionCompleta.id_ubicacion,
    tipoUbicacion: ubicacionCompleta.tipo_ubicacion || 'Origen',
    ordenSecuencia: 1,
    rfcRemitenteDestinatario: ubicacionCompleta.rfc_remitente_destinatario,
    nombreRemitenteDestinatario: ubicacionCompleta.nombre_remitente_destinatario,
    fechaHoraSalidaLlegada: ubicacionCompleta.fecha_hora_salida_llegada,
    distanciaRecorrida: ubicacionCompleta.distancia_recorrida,
    coordenadas: ubicacionCompleta.coordenadas,
    domicilio: {
      pais: ubicacionCompleta.domicilio.pais,
      codigoPostal: ubicacionCompleta.domicilio.codigo_postal,
      estado: ubicacionCompleta.domicilio.estado,
      municipio: ubicacionCompleta.domicilio.municipio,
      colonia: ubicacionCompleta.domicilio.colonia,
      calle: ubicacionCompleta.domicilio.calle,
      numExterior: ubicacionCompleta.domicilio.numero_exterior,
      numInterior: ubicacionCompleta.domicilio.numero_interior,
      referencia: ubicacionCompleta.domicilio.referencia,
      localidad: ubicacionCompleta.domicilio.localidad
    },
    tipoEstacion: ubicacionCompleta.tipo_estacion,
    numeroEstacion: ubicacionCompleta.numero_estacion,
    kilometro: ubicacionCompleta.kilometro
  };
};
