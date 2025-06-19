
// Tipo para ubicaciones en el frontend (camelCase)
export interface Ubicacion {
  id: string;
  idUbicacion: string;
  tipoUbicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
  rfcRemitenteDestinatario?: string;
  nombreRemitenteDestinatario?: string;
  fechaHoraSalidaLlegada?: string;
  distanciaRecorrida?: number;
  ordenSecuencia: number;
  
  // Campos nuevos agregados en la migración
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
    numExterior: string;
    numInterior?: string;
    referencia?: string;
    localidad: string; // Campo del frontend
  };
}

// Tipo para ubicaciones frecuentes
export interface UbicacionFrecuente {
  id: string;
  nombreUbicacion: string;
  rfcAsociado: string;
  domicilio: {
    pais: string;
    codigoPostal: string;
    estado: string;
    municipio: string;
    colonia: string;
    calle: string;
    numExterior: string;
    numInterior?: string;
    referencia?: string;
    localidad?: string;
  };
  fechaCreacion: string;
  vecesUsada: number;
}

// Tipo para coordenadas geográficas
export interface Coordinates {
  latitud: number;
  longitud: number;
}

// Tipos adicionales para geocodificación
export interface GeocodingResult {
  coordinates: Coordinates;
  formattedAddress: string;
  addressComponents: {
    codigoPostal?: string;
    estado?: string;
    municipio?: string;
    colonia?: string;
    calle?: string;
  };
}
