
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { UbicacionCompleta } from '@/types/cartaPorte';

export class XMLUtils {
  static generarFolio(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp}${random}`;
  }

  static obtenerCodigoPostalExpedicion(data: CartaPorteData): string {
    const origen = data.ubicaciones?.find(u => u.tipo_ubicacion === 'Origen');
    return origen?.domicilio?.codigo_postal || '';
  }

  static obtenerCodigoPostalReceptor(data: CartaPorteData): string {
    const destino = data.ubicaciones?.find(u => u.tipo_ubicacion === 'Destino');
    return destino?.domicilio?.codigo_postal || '';
  }

  static calcularDistanciaTotal(ubicaciones: UbicacionCompleta[]): number {
    return ubicaciones?.reduce((total, ubicacion) => {
      return total + (ubicacion.distancia_recorrida || 0);
    }, 0) || 0;
  }

  static construirAtributosInternacionales(data: CartaPorteData): string {
    if (!data.transporteInternacional) return '';

    return (
      `EntradaSalidaMerc="${data.entradaSalidaMerc ?? ''}" ` +
      `PaisOrigenDestino="${data.pais_origen_destino ?? ''}" ` +
      `ViaEntradaSalida="${data.via_entrada_salida ?? ''}" `
    );
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
  return origen?.domicilio?.codigo_postal || '';
};

export const getUbicacionDestino = (data: any) => {
  const destino = data.ubicaciones?.find((u: any) => u.tipo_ubicacion === 'Destino');
  return destino?.domicilio?.codigo_postal || '';
};

export const buildComplementoCartaPorte = (data: any): string => {
  return `<cartaporte31:CartaPorte
    Version="3.1"
    TranspInternac="${data.transporteInternacional ? 'Sí' : 'No'}"
    ${XMLUtils.construirAtributosInternacionales(data)}
    TotalDistRec="${data.totalDistRec ?? 0}" />`;
};
