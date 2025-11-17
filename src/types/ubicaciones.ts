
export interface Ubicacion {
  id: string;
  idUbicacion: string;
  tipoUbicacion: 'Origen' | 'Destino' | 'Paso Intermedio' | ''; // Permitir string vacío
  rfcRemitenteDestinatario?: string;
  nombreRemitenteDestinatario?: string;
  numRegIdTrib?: string; // SAT: Número de registro de identidad tributaria (para extranjeros)
  residenciaFiscal?: string; // SAT: País de residencia fiscal (clave país)
  fechaHoraSalidaLlegada?: string;
  distanciaRecorrida?: number;
  ordenSecuencia?: number;
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
    localidad?: string;
    referencia?: string;
  };
}

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
    numExterior?: string;
    numInterior?: string;
    localidad?: string;
    referencia?: string;
  };
  fechaCreacion: string;
  vecesUsada: number;
  usoCount?: number; // alias for vecesUsada for compatibility
}

// Coordinates interface for mapping compatibility
export interface Coordinates {
  lat: number;
  lng: number;
  latitud?: number;
  longitud?: number;
}
