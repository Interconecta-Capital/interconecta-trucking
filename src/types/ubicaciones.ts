
export interface Ubicacion {
  id: string;
  idUbicacion: string;
  tipoUbicacion: 'Origen' | 'Destino';
  rfcRemitenteDestinatario?: string;
  nombreRemitenteDestinatario?: string;
  fechaHoraSalidaLlegada?: string;
  distanciaRecorrida?: number;
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
