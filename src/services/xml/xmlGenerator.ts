
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { XMLValidation } from './xmlValidation';
import { XMLUtils } from './xmlUtils';
import { XMLConceptosBuilder } from './xmlConceptos';
import { XMLComplementoBuilder } from './xmlComplemento';
import { XML_NAMESPACES, SCHEMA_LOCATIONS } from './xmlNamespaces';

export interface XMLGenerationResult {
  success: boolean;
  xml?: string;
  errors?: string[];
  warnings?: string[];
}

export class XMLCartaPorteGenerator {
  static async generarXML(data: CartaPorteData): Promise<XMLGenerationResult> {
    try {
      // Validar datos antes de generar XML
      const validationResult = await XMLValidation.validateCartaPorteData(data);
      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors
        };
      }

      const xml = this.construirXML(data);
      
      return {
        success: true,
        xml,
        warnings: validationResult.warnings
      };
    } catch (error) {
      console.error('Error generando XML:', error);
      return {
        success: false,
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
    }
  }

  private static construirXML(data: CartaPorteData): string {
    const fechaActual = new Date().toISOString();
    const folio = XMLUtils.generarFolio();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
  xmlns:cfdi="${XML_NAMESPACES.cfdi}"
  xmlns:cartaporte31="${XML_NAMESPACES.cartaporte31}"
  xmlns:xsi="${XML_NAMESPACES.xsi}"
  xsi:schemaLocation="${SCHEMA_LOCATIONS}"
  Version="4.0"
  Serie="CP"
  Folio="${folio}"
  Fecha="${fechaActual}"
  TipoDeComprobante="${data.tipoCfdi === 'Traslado' ? 'T' : 'I'}"
  SubTotal="0"
  Total="0"
  Moneda="XXX"
  LugarExpedicion="${XMLUtils.obtenerCodigoPostalExpedicion(data)}">
  
  ${XMLConceptosBuilder.construirEmisor(data)}
  ${XMLConceptosBuilder.construirReceptor(data)}
  ${XMLConceptosBuilder.construirConceptos(data)}
  ${XMLComplementoBuilder.construirComplemento(data)}
  
</cfdi:Comprobante>`;
  }
}
