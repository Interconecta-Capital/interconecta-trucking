
export interface Ubicacion {
  id: string;
  idUbicacion?: string;
  tipoUbicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
  rfcRemitenteDestinatario?: string;
  nombreRemitenteDestinatario?: string;
  fechaHoraSalidaLlegada?: string;
  distanciaRecorrida?: number;
  ordenSecuencia: number;
  tipoEstacion?: string;
  numeroEstacion?: string;
  kilometro?: number;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  domicilio: {
    pais: string;
    codigoPostal: string;
    estado: string;
    municipio: string;
    colonia: string;
    calle: string;
    numExterior?: string;
    numInterior?: string;
    referencia?: string;
    localidad?: string;
  };
}

export interface UbicacionFrecuente {
  id: string;
  nombre: string;
  tipo_ubicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
  rfc_remitente_destinatario?: string;
  nombre_remitente_destinatario?: string;
  domicilio: {
    calle: string;
    numero_exterior?: string;
    numero_interior?: string;
    colonia: string;
    localidad?: string;
    municipio: string;
    estado: string;
    pais: string;
    codigo_postal: string;
    referencia?: string;
  };
  uso_count?: number;
  usoCount?: number;
  created_at: string;
  updated_at: string;
}

export interface Coordinates {
  latitud: number;
  longitud: number;
}

export interface GeocodeResult {
  ubicacion: Ubicacion;
  coordenadas: Coordinates;
  direccionFormateada: string;
}
