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
  selloSAT?: string;
  folio?: string;
  error?: string;
  codigo?: string;
  certificadoUsado?: {
    numero: string;
    rfc: string;
    nombre: string;
  };
  fechaTimbrado?: string;
  certificadoSAT?: string;
  pac?: string;
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
   * Llamada REAL a SW/Conectia PAC
   */
  private static async llamarFiscalAPI(data: any): Promise<TimbradoResponse> {
    try {
      console.log('📤 Invocando edge function de SW/Conectia...');
      
      const { data: result, error } = await supabase.functions.invoke('timbrar-con-sw', {
        body: {
          cartaPorteData: data,
          cartaPorteId: data.cartaPorteId || crypto.randomUUID(),
          ambiente: data.environment || 'sandbox'
        }
      });

      if (error) {
        console.error('❌ Error en edge function:', error);
        throw new Error(error.message || 'Error llamando a función de timbrado');
      }

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          codigo: result.codigo,
          details: result.details
        };
      }

      console.log(`✅ Timbrado exitoso con SW/Conectia - UUID: ${result.uuid}`);

      return {
        success: true,
        uuid: result.uuid,
        xmlTimbrado: result.xmlTimbrado,
        qrCode: result.qrCode,
        cadenaOriginal: result.cadenaOriginal,
        selloDigital: result.selloDigital,
        selloSAT: result.selloSAT,
        folio: result.noCertificadoCFDI,
        fechaTimbrado: result.fechaTimbrado,
        certificadoSAT: result.noCertificadoSAT,
        pac: result.pac
      };

    } catch (error) {
      console.error('💥 Error en llamarFiscalAPI:', error);
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
      console.log('💾 Guardando datos de timbrado para Carta Porte:', cartaPorteId);
      
      // 1. Actualizar cartas_porte con datos de timbrado
      const { error: updateError } = await supabase
        .from('cartas_porte')
        .update({
          status: 'timbrado',
          uuid_fiscal: datos.uuid,
          fecha_timbrado: datos.fecha_timbrado,
          xml_generado: datos.xml_timbrado,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartaPorteId);
        
      if (updateError) throw updateError;
      
      // 2. Incrementar contador de timbres consumidos
      await this.incrementarContadorTimbres(cartaPorteId);
      
      // 3. Guardar XML timbrado en Storage
      await this.guardarXMLEnStorage(cartaPorteId, datos.xml_timbrado);
      
      console.log('✅ Datos de timbrado guardados exitosamente');
      
    } catch (error) {
      console.error('❌ Error guardando datos de timbrado:', error);
      throw error;
    }
  }

  /**
   * Incrementa el contador de timbres consumidos
   */
  private static async incrementarContadorTimbres(cartaPorteId: string) {
    try {
      // Obtener user_id de la carta porte
      const { data: carta } = await supabase
        .from('cartas_porte')
        .select('usuario_id')
        .eq('id', cartaPorteId)
        .single();
        
      if (!carta) return;
      
      // ✅ Incrementar contador de timbres
      const { data: profile } = await supabase
        .from('profiles')
        .select('timbres_consumidos')
        .eq('id', carta.usuario_id)
        .single();
        
      await supabase
        .from('profiles')
        .update({ 
          timbres_consumidos: (profile?.timbres_consumidos || 0) + 1
        })
        .eq('id', carta.usuario_id);
      
      console.log('✅ Contador de timbres incrementado');
      
    } catch (error) {
      console.error('❌ Error incrementando contador de timbres:', error);
    }
  }

  /**
   * Guarda XML timbrado en Storage
   */
  private static async guardarXMLEnStorage(cartaPorteId: string, xmlContent: string) {
    try {
      const fileName = `cartas-porte/timbrados/${cartaPorteId}.xml`;
      
      const { error } = await supabase.storage
        .from('documentos')
        .upload(fileName, new Blob([xmlContent], { type: 'application/xml' }), {
          upsert: true
        });
        
      if (error) throw error;
      
      console.log('✅ XML guardado en Storage');
      
    } catch (error) {
      console.error('❌ Error guardando XML en Storage:', error);
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
