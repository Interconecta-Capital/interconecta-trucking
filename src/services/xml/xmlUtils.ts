
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
