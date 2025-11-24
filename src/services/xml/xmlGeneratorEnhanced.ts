import { CartaPorteData } from '@/types/cartaPorte';
import { XMLValidatorSAT31, ValidationResult31 } from './xmlValidatorSAT31';
import { XMLNamespaceManager } from './xmlNamespaceManager';
import { XMLConceptosBuilder } from './xmlConceptos';
import { XMLComplementoBuilder } from './xmlComplemento';
import { CartaPorteVersion } from '@/types/cartaPorteVersions';

export interface XMLGenerationResultEnhanced {
  success: boolean;
  xml?: string;
  errors?: string[];
  warnings?: string[];
  validationDetails?: ValidationResult31;
  fiscalData?: {
    subtotal: number;
    iva: number;
    total: number;
    moneda: string;
  };
}

export class XMLGeneratorEnhanced {
  static async generarXMLCompleto(data: CartaPorteData): Promise<XMLGenerationResultEnhanced> {
    try {
      console.log('🚀 Generando XML SAT 3.1 completo...');

      // Validación exhaustiva
      const validationResult = await XMLValidatorSAT31.validateCompleteCartaPorte(data);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors.map(e => e.message),
          validationDetails: validationResult
        };
      }

      // Enriquecer datos con información faltante
      const enrichedData = await this.enrichCartaPorteData(data);

      // Calcular valores fiscales
      const fiscalData = this.calculateFiscalValues(enrichedData);

      // Generar XML estructurado
      const xml = this.buildCompleteXML(enrichedData, fiscalData);

      // Validar XML generado
      const xmlValidation = this.validateGeneratedXML(xml);
      if (!xmlValidation.success) {
        return {
          success: false,
          errors: xmlValidation.errors
        };
      }

      return {
        success: true,
        xml,
        warnings: validationResult.warnings.map(w => w.message),
        validationDetails: validationResult,
        fiscalData
      };

    } catch (error) {
      console.error('💥 Error generando XML:', error);
      return {
        success: false,
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
    }
  }

  private static async enrichCartaPorteData(data: CartaPorteData): Promise<CartaPorteData> {
    const enriched = { ...data };

    // Asegurar ID CCP único
    if (!enriched.cartaPorteId || enriched.cartaPorteId.length !== 36) {
      enriched.cartaPorteId = this.generateIdCCP();
    }

    // Asegurar versión 3.1
    enriched.cartaPorteVersion = '3.1';

    // Enriquecer ubicaciones
    if (enriched.ubicaciones) {
      enriched.ubicaciones = enriched.ubicaciones.map((ubicacion, index) => ({
        ...ubicacion,
        id_ubicacion: ubicacion.id_ubicacion || this.generateUbicacionId(ubicacion.tipo_ubicacion, index),
        fecha_llegada_salida: ubicacion.fecha_llegada_salida || this.formatFechaSAT(new Date())
      }));
    }

    // Enriquecer mercancías
    if (enriched.mercancias) {
      enriched.mercancias = enriched.mercancias.map(mercancia => ({
        ...mercancia,
        bienes_transp: mercancia.bienes_transp || '78101800',
        clave_unidad: mercancia.clave_unidad || 'KGM',
        moneda: mercancia.moneda || 'MXN'
      }));
    }

    // Enriquecer autotransporte
    if (enriched.autotransporte) {
      enriched.autotransporte = {
        ...enriched.autotransporte,
        config_vehicular: enriched.autotransporte.config_vehicular || 'C2',
        perm_sct: enriched.autotransporte.perm_sct || 'TPAF01'
      };
    }

    return enriched;
  }

  private static calculateFiscalValues(data: CartaPorteData) {
    if (data.tipoCfdi === 'Traslado') {
      return {
        subtotal: 0,
        iva: 0,
        total: 0,
        moneda: 'XXX'
      };
    }

    // Calcular subtotal
    const subtotal = data.mercancias?.reduce((sum, m) => sum + (m.valor_mercancia || 0), 0) || 0;
    
    // Calcular IVA (16%)
    const iva = subtotal * 0.16;
    
    // Total
    const total = subtotal + iva;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      iva: Number(iva.toFixed(2)),
      total: Number(total.toFixed(2)),
      moneda: 'MXN'
    };
  }

  private static buildCompleteXML(data: CartaPorteData, fiscal: any): string {
    const namespaceManager = new XMLNamespaceManager('3.1' as CartaPorteVersion);
    const folio = this.generateFolio();
    const fecha = this.formatFechaSAT(new Date());

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante ${namespaceManager.getAllNamespaces()}
  ${namespaceManager.getSchemaLocation()}
  Version="4.0"
  Serie="CP"
  Folio="${folio}"
  Fecha="${fecha}"
  TipoDeComprobante="${data.tipoCfdi === 'Traslado' ? 'T' : 'I'}"
  SubTotal="${fiscal.subtotal}"
  Total="${fiscal.total}"
  Moneda="${fiscal.moneda}"
  LugarExpedicion="${this.getCodigoPostalExpedicion(data)}">

  ${this.buildEmisor(data)}
  ${this.buildReceptor(data)}
  ${XMLConceptosBuilder.construirConceptos(data)}
  ${fiscal.iva > 0 ? this.buildImpuestos(fiscal) : ''}
  ${XMLComplementoBuilder.construirComplemento(data)}

</cfdi:Comprobante>`;

    return xml;
  }

  private static buildEmisor(data: CartaPorteData): string {
    return `<cfdi:Emisor 
    Rfc="${data.rfcEmisor}" 
    Nombre="${data.nombreEmisor}"
    RegimenFiscal="${data.regimenFiscalEmisor || '601'}" />`;
  }

  private static buildReceptor(data: CartaPorteData): string {
    const destino = data.ubicaciones?.find(u => u.tipo_ubicacion === 'Destino');
    const cpReceptor = destino?.domicilio?.codigo_postal || '01000';

    return `<cfdi:Receptor 
    Rfc="${data.rfcReceptor}" 
    Nombre="${data.nombreReceptor}"
    DomicilioFiscalReceptor="${cpReceptor}"
    RegimenFiscalReceptor="601"
    UsoCFDI="${data.usoCfdi || 'S01'}" />`;
  }

  private static buildImpuestos(fiscal: any): string {
    return `<cfdi:Impuestos TotalImpuestosTrasladados="${fiscal.iva}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${fiscal.subtotal}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${fiscal.iva}" />
    </cfdi:Traslados>
  </cfdi:Impuestos>`;
  }

  private static validateGeneratedXML(xml: string) {
    try {
      // Validaciones básicas
      if (!xml.includes('cfdi:Comprobante')) {
        return { success: false, errors: ['XML no contiene elemento Comprobante'] };
      }

      if (!xml.includes('CartaPorte')) {
        return { success: false, errors: ['XML no contiene complemento CartaPorte'] };
      }

      // Validar formato XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');
      const errors = xmlDoc.getElementsByTagName('parsererror');
      
      if (errors.length > 0) {
        return { success: false, errors: ['XML mal formado'] };
      }

      return { success: true };
    } catch (error) {
      return { success: false, errors: ['Error validando XML'] };
    }
  }

  private static generateIdCCP(): string {
    return crypto.randomUUID().replace(/-/g, '').toUpperCase().substring(0, 36);
  }

  private static generateUbicacionId(tipo: string, index: number): string {
    const prefix = tipo === 'Origen' ? 'OR' : tipo === 'Destino' ? 'DE' : 'UB';
    return `${prefix}${String(index + 1).padStart(6, '0')}`;
  }

  private static generateFolio(): string {
    return `CP${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  private static getCodigoPostalExpedicion(data: CartaPorteData): string {
    const origen = data.ubicaciones?.find(u => u.tipo_ubicacion === 'Origen');
    return origen?.domicilio?.codigo_postal || '01000';
  }

  /**
   * Formatea fecha según especificación del SAT para CFDI 4.0
   * Formato: YYYY-MM-DDTHH:MM:SS (sin milisegundos ni zona horaria)
   */
  private static formatFechaSAT(fecha: Date = new Date()): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
