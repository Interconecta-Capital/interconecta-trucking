
export interface Domicilio {
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
}

export interface Ubicacion {
  id: string;
  idUbicacion?: string;
  tipoUbicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
  rfcRemitenteDestinatario?: string;
  nombreRemitenteDestinatario?: string;
  fechaHoraSalidaLlegada?: string;
  distanciaRecorrida?: number;
  ordenSecuencia: number;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  domicilio: Domicilio;
}
