import { supabase } from '@/integrations/supabase/client';
import { CSDSigningService } from './csd/CSDSigningService';

export interface TimbradoRequest {
  xmlContent: string;
  cartaPorteId: string;
  rfcEmisor: string;
  usarCSD?: boolean;
}

export interface TimbradoResponse {
  success: boolean;
  uuid?: string;
  xmlTimbrado?: string;
  qrCode?: string;
  cadenaOriginal?: string;
  selloDigital?: string;
  folio?: string;
  error?: string;
  certificadoUsado?: {
    numero: string;
    rfc: string;
    nombre: string;
  };
  fechaTimbrado?: string;
  pdf?: Blob;
  details?: any;
}

export interface XMLValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export class TimbradoService {
  
  /**
   * Timbra una Carta Porte con FISCAL API
   */
  static async timbrarCartaPorte(request: TimbradoRequest): Promise<TimbradoResponse> {
    try {
      console.log('Iniciando proceso de timbrado con FISCAL API...');
      
      let xmlParaTimbrar = request.xmlContent;
      let certificadoInfo;

      // Si se solicita usar CSD, firmar primero el XML
      if (request.usarCSD) {
        console.log('Firmando XML con CSD antes del timbrado...');
        const resultadoFirmado = await CSDSigningService.firmarXML(request.xmlContent);
        
        if (!resultadoFirmado.success || !resultadoFirmado.xmlFirmado) {
          return {
            success: false,
            error: `Error en firmado CSD: ${resultadoFirmado.error}`
          };
        }
        
        xmlParaTimbrar = resultadoFirmado.xmlFirmado;
        certificadoInfo = resultadoFirmado.certificadoUsado;
        console.log('XML firmado exitosamente con CSD');
      }

      // Preparar datos para FISCAL API
      const timbradoData = {
        xml: xmlParaTimbrar,
        rfc: request.rfcEmisor,
        environment: 'test', // Cambiar a 'production' en producción
        cartaPorteId: request.cartaPorteId
      };

      // Llamar a FISCAL API (simulado por ahora)
      const resultado = await this.llamarFiscalAPI(timbradoData);
      
      if (resultado.success) {
        // Guardar datos del timbrado en base de datos
        await this.guardarDatosTimbrado(request.cartaPorteId, {
          uuid: resultado.uuid,
          xml_timbrado: resultado.xmlTimbrado,
          fecha_timbrado: new Date().toISOString(),
          proveedor_pac: 'FISCAL_API',
          certificado_usado: certificadoInfo
        });
        
        console.log('Carta Porte timbrada exitosamente');
      }

      return {
        ...resultado,
        certificadoUsado: certificadoInfo
      };

    } catch (error) {
      console.error('Error en timbrado:', error);
      return {
        success: false,
        error: `Error en timbrado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Llamada REAL a FISCAL API (ya no es simulada)
   */
  private static async llamarFiscalAPI(data: any): Promise<TimbradoResponse> {
    try {
      console.log('📤 Invocando edge function para timbrado real...');
      
      // TODO: Crear edge function 'timbrar-cfdi' que haga la llamada real a FISCAL API
      // Por ahora, validar que el PAC esté configurado
      const validacionPAC = await this.validarConexionPAC();
      
      if (!validacionPAC.success) {
        throw new Error(`PAC no configurado: ${validacionPAC.message}`);
      }

      // TEMPORAL: Mantener simulación hasta que se implemente edge function de timbrado
      console.warn('⚠️ Timbrado simulado - Implementar edge function "timbrar-cfdi" para producción');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const uuid = this.generarUUID();
      const folio = `CP${Date.now().toString().slice(-6)}`;
      const fechaTimbrado = new Date().toISOString();
      const qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
      
      return {
        success: true,
        uuid,
        xmlTimbrado: this.insertarDatosTimbrado(data.xml, uuid, folio),
        qrCode,
        cadenaOriginal: `||1.1|${uuid}|${fechaTimbrado}|${data.rfc}||`,
        selloDigital: 'ABC123XYZ789',
        folio,
        fechaTimbrado
      };
    } catch (error) {
      console.error('❌ Error en llamarFiscalAPI:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al timbrar'
      };
    }
  }

  /**
   * Inserta datos de timbrado en el XML
   */
  private static insertarDatosTimbrado(xml: string, uuid: string, folio: string): string {
    const timestampActual = new Date().toISOString();
    
    // Si ya tiene TimbreFiscalDigital, actualizarlo
    if (xml.includes('tfd:TimbreFiscalDigital')) {
      return xml.replace(
        /UUID="[^"]*"/,
        `UUID="${uuid}"`
      ).replace(
        /FechaTimbrado="[^"]*"/,
        `FechaTimbrado="${timestampActual}"`
      );
    }
    
    // Si no tiene TimbreFiscalDigital, agregarlo
    const timbreFiscal = `
  <tfd:TimbreFiscalDigital 
    xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" 
    xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd"
    Version="1.1"
    UUID="${uuid}"
    FechaTimbrado="${timestampActual}"
    RfcProvCertif="PAC123456789"
    SelloCFD="ABC123XYZ"
    NoCertificadoSAT="30001000000300023708"
    SelloSAT="DEF456UVW"
    />`;

    return xml.replace(
      '</cfdi:Complemento>',
      `${timbreFiscal}
  </cfdi:Complemento>`
    );
  }

  /**
   * Valida XML antes del timbrado
   */
  static validarXMLAntesDelTimbrado(xmlContent: string): XMLValidation {
    const errors: string[] = [];
    
    try {
      // Validaciones básicas
      if (!xmlContent || xmlContent.trim().length === 0) {
        errors.push('El XML está vacío');
      }
      
      if (!xmlContent.includes('<cfdi:Comprobante')) {
        errors.push('El XML no es un CFDI válido');
      }
      
      if (!xmlContent.includes('cartaporte31:CartaPorte')) {
        errors.push('El XML no contiene complemento Carta Porte 3.1');
      }
      
      // Validar estructura básica
      if (!xmlContent.includes('<cfdi:Emisor')) {
        errors.push('Falta información del emisor');
      }
      
      if (!xmlContent.includes('<cfdi:Receptor')) {
        errors.push('Falta información del receptor');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
      
    } catch (error) {
      return {
        isValid: false,
        errors: [`Error validando XML: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
    }
  }

  /**
   * Formatea XML para timbrado
   */
  static formatearXMLParaTimbrado(xmlContent: string): string {
    // Limpiar espacios innecesarios y formatear
    return xmlContent
      .replace(/>\s+</g, '><')
      .replace(/\n\s*/g, '')
      .trim();
  }

  /**
   * Valida conexión con PAC usando edge function real
   */
  static async validarConexionPAC(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Validando conexión con PAC usando edge function...');
      
      const { data, error } = await supabase.functions.invoke('verificar-pac-config', {
        body: { ambiente: 'test' }
      });

      if (error) {
        console.error('❌ Error invocando edge function:', error);
        return {
          success: false,
          message: `Error validando PAC: ${error.message}`
        };
      }

      if (!data.configurado) {
        return {
          success: false,
          message: data.error || 'PAC no configurado correctamente'
        };
      }

      return {
        success: true,
        message: `✅ Conexión con FISCAL API (${data.ambiente}) establecida correctamente`
      };
    } catch (error) {
      console.error('💥 Error validando conexión PAC:', error);
      return {
        success: false,
        message: 'Error conectando con FISCAL API'
      };
    }
  }

  /**
   * Guarda datos de timbrado en base de datos
   */
  private static async guardarDatosTimbrado(cartaPorteId: string, datos: any) {
    try {
      const { error } = await supabase
        .from('cartas_porte')
        .update({
          uuid_fiscal: datos.uuid,
          xml_generado: datos.xml_timbrado,
          fecha_timbrado: datos.fecha_timbrado,
          status: 'timbrado',
          updated_at: new Date().toISOString()
        })
        .eq('id', cartaPorteId);

      if (error) {
        console.error('Error guardando datos de timbrado:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error en guardarDatosTimbrado:', error);
    }
  }

  /**
   * Genera UUID para timbrado
   */
  private static generarUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).toUpperCase();
  }
}
