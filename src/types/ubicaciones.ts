
import { Coordinates } from '@/services/mapService';

export interface Ubicacion {
  id?: string;
  idUbicacion: string;
  tipoUbicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
  rfcRemitenteDestinatario: string;
  nombreRemitenteDestinatario: string;
  fechaHoraSalidaLlegada?: string;
  distanciaRecorrida?: number;
  ordenSecuencia?: number;
  coordenadas?: Coordinates;
  domicilio: {
    pais: string;
    codigoPostal: string;
    estado: string;
    municipio: string;
    localidad?: string;
    colonia: string;
    calle: string;
    numExterior: string;
    numInterior?: string;
    referencia?: string;
  };
}

export interface UbicacionFrecuente {
  id: string;
  nombreUbicacion: string;
  rfcAsociado: string;
  domicilio: Ubicacion['domicilio'];
  coordenadas?: Coordinates;
  usoCount: number;
}
