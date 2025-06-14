import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { Ubicacion } from '@/types/ubicaciones';

export class XMLUtils {
  static generarFolio(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp}${random}`;
  }

  static obtenerCodigoPostalExpedicion(data: CartaPorteData): string {
    const origen = data.ubicaciones?.find(u => u.tipoUbicacion === 'Origen');
    return origen?.domicilio?.codigoPostal || '01000';
  }

  static obtenerCodigoPostalReceptor(data: CartaPorteData): string {
    const destino = data.ubicaciones?.find(u => u.tipoUbicacion === 'Destino');
    return destino?.domicilio?.codigoPostal || '01000';
  }

  static calcularDistanciaTotal(ubicaciones: Ubicacion[]): number {
    return ubicaciones?.reduce((total, ubicacion) => {
      return total + (ubicacion.distanciaRecorrida || 0);
    }, 0) || 0;
  }

  static construirAtributosInternacionales(data: CartaPorteData): string {
    let attrs = '';
    if (data.transporteInternacional) {
      attrs += `EntradaSalidaMerc="${data.entrada_salida_merc || ''}" `;
      attrs += `PaisOrigenDestino="${data.pais_origen_destino || ''}" `;
      attrs += `ViaEntradaSalida="${data.via_entrada_salida || ''}" `;
    }
    return attrs;
  }

  static getTipoFiguraDescripcion(tipo: string): string {
    const tipos: { [key: string]: string } = {
      '01': 'Operador',
      '02': 'Propietario',
      '03': 'Arrendador',
      '04': 'Notificado'
    };
    return tipos[tipo] || tipo;
  }
}

export const getUbicacionOrigen = (data: any) => {
  const origen = data.ubicaciones?.find((u: any) => u.tipo_ubicacion === 'Origen');
  return origen?.domicilio?.codigo_postal || '01000';
};

export const getUbicacionDestino = (data: any) => {
  const destino = data.ubicaciones?.find((u: any) => u.tipo_ubicacion === 'Destino');
  return destino?.domicilio?.codigo_postal || '01000';
};

export const buildComplementoCartaPorte = (data: any): string => {
  const origen = data.ubicaciones?.find((u: any) => u.tipo_ubicacion === 'Origen');
  const destino = data.ubicaciones?.find((u: any) => u.tipo_ubicacion === 'Destino');
  
  return `<cartaporte31:CartaPorte 
    Version="3.1"
    TranspInternac="${data.transporteInternacional ? 'Sí' : 'No'}"
    EntradaSalidaMerc="${data.entradaSalidaMerc || 'Entrada'}"
    PaisOrigenDestino="${origen?.domicilio?.pais || 'MEX'}"
    ViaEntradaSalida="${destino?.domicilio?.pais || 'MEX'}"
    TotalDistRec="${data.totalDistRec || 0}" />`;
};
