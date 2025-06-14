
export interface Ubicacion {
  id: string;
  idUbicacion: string;
  tipoUbicacion: 'Origen' | 'Destino';
  rfcRemitenteDestinatario?: string;
  nombreRemitenteDestinatario?: string;
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
  nombre: string;
  ubicacion: Ubicacion;
  fechaCreacion: string;
  vecesUsada: number;
}

// Coordinates interface for mapping compatibility
export interface Coordinates {
  lat: number;
  lng: number;
  latitud?: number;
  longitud?: number;
}
