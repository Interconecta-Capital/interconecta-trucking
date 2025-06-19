
import { CartaPorteData } from '@/types/cartaPorte';

export class XMLConceptosBuilder {
  static construirConceptos(data: CartaPorteData): string {
    const conceptos = data.mercancias?.map((mercancia, index) => {
      return `<cfdi:Concepto 
        ClaveProdServ="${mercancia.bienes_transp || '78101800'}"
        Cantidad="${mercancia.cantidad || 1}"
        ClaveUnidad="${mercancia.clave_unidad || 'KGM'}"
        Descripcion="${mercancia.descripcion || 'Servicio de transporte de carga'}"
        ValorUnitario="0"
        Importe="0"
        ObjetoImp="01" />`;
    }).join('\n    ') || '';

    return `<cfdi:Conceptos>
    ${conceptos}
  </cfdi:Conceptos>`;
  }

  static construirEmisor(data: CartaPorteData): string {
    return `<cfdi:Emisor 
    Rfc="${data.rfcEmisor}" 
    Nombre="${data.nombreEmisor}"
    RegimenFiscal="601" />`;
  }

  static construirReceptor(data: CartaPorteData): string {
    return `<cfdi:Receptor 
    Rfc="${data.rfcReceptor}" 
    Nombre="${data.nombreReceptor}"
    DomicilioFiscalReceptor="${this.obtenerCodigoPostalReceptor(data)}"
    RegimenFiscalReceptor="601"
    UsoCFDI="S01" />`;
  }

  private static obtenerCodigoPostalReceptor(data: CartaPorteData): string {
    const destino = data.ubicaciones?.find(u => u.tipo_ubicacion === 'Destino');
    return destino?.domicilio?.codigo_postal || '01000';
  }
}
