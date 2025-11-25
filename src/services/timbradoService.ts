import { supabase } from '@/integrations/supabase/client';
import { CSDSigningService } from './csd/CSDSigningService';
import logger from '@/utils/logger';

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
      logger.info('timbrado', 'Iniciando proceso de timbrado con FISCAL API', { cartaPorteId: request.cartaPorteId });
      
      let xmlParaTimbrar = request.xmlContent;
      let certificadoInfo;

      // Si se solicita usar CSD, firmar primero el XML
      if (request.usarCSD) {
        logger.info('csd', 'Firmando XML con CSD antes del timbrado');
        const resultadoFirmado = await CSDSigningService.firmarXML(request.xmlContent);
        
        if (!resultadoFirmado.success || !resultadoFirmado.xmlFirmado) {
          return {
            success: false,
            error: `Error en firmado CSD: ${resultadoFirmado.error}`
          };
        }
        
        xmlParaTimbrar = resultadoFirmado.xmlFirmado;
        certificadoInfo = resultadoFirmado.certificadoUsado;
        logger.info('csd', 'XML firmado exitosamente con CSD');
      }

      // Preparar datos para FISCAL API
      const timbradoData = {
        xml: xmlParaTimbrar,
        rfc: request.rfcEmisor,
        environment: 'test',
        cartaPorteId: request.cartaPorteId
      };

      // Llamar a FISCAL API
      const resultado = await this.llamarFiscalAPI(timbradoData);
      
      if (resultado.success) {
        // Guardar datos del timbrado en base de datos
        await this.guardarDatosTimbrado(request.cartaPorteId, {
          uuid: resultado.uuid,
          xml_timbrado: resultado.xmlTimbrado,
          fecha_timbrado: new Date().toISOString(),
          proveedor_pac: 'smartweb',
          certificado_usado: certificadoInfo
        });
        
        logger.info('timbrado', 'Carta Porte timbrada exitosamente', { 
          cartaPorteId: request.cartaPorteId,
          uuid: resultado.uuid 
        });
      }

      return {
        ...resultado,
        certificadoUsado: certificadoInfo
      };

    } catch (error) {
      logger.error('timbrado', 'Error en timbrado', error);
      return {
        success: false,
        error: `Error en timbrado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Llamada REAL a SW/Conectia PAC usando V2 (con fallback a legacy)
   */
  private static async llamarFiscalAPI(data: any): Promise<TimbradoResponse> {
    try {
      logger.info('timbrado', 'Invocando edge function V2 de SW/Conectia');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      const { data: config } = await supabase
        .from('configuracion_empresa')
        .select('rfc_emisor, razon_social, regimen_fiscal, modo_pruebas')
        .eq('user_id', user.id)
        .single();
      
      if (!config) {
        throw new Error('Configuración de empresa no encontrada');
      }
      
      const ambiente = config.modo_pruebas ? 'sandbox' : 'produccion';
      
      logger.debug('timbrado', 'Configuración de timbrado', { 
        ambiente, 
        rfcEmisor: config.rfc_emisor?.substring(0, 3) + '***' 
      });
      
      const { data: result, error } = await supabase.functions.invoke('timbrar-cfdi-v2', {
        body: {
          cartaPorteData: {
            xml: data.xml,
            rfcEmisor: config.rfc_emisor,
            nombreEmisor: config.razon_social,
            regimenFiscalEmisor: config.regimen_fiscal,
            cartaPorteId: data.cartaPorteId
          },
          cartaPorteId: data.cartaPorteId || crypto.randomUUID(),
          ambiente: ambiente
        }
      });

      if (error) {
        logger.warn('timbrado', 'Error en edge function V2, intentando legacy', { error: error.message });
        return await this.llamarFiscalAPILegacy(data);
      }

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          codigo: result.codigo,
          details: result.details
        };
      }

      logger.info('timbrado', 'Timbrado exitoso con V2', { uuid: result.data?.uuid });

      return {
        success: true,
        uuid: result.data.uuid,
        xmlTimbrado: result.data.xml,
        cadenaOriginal: result.data.cadenaOriginal,
        folio: result.data.noCertificadoSAT,
        fechaTimbrado: result.data.fechaTimbrado,
        certificadoSAT: result.data.noCertificadoSAT,
        pac: 'SW_V2'
      };

    } catch (error) {
      logger.error('timbrado', 'Error en llamarFiscalAPI V2', error);
      return await this.llamarFiscalAPILegacy(data);
    }
  }

  /**
   * Fallback a versión legacy de timbrado
   */
  private static async llamarFiscalAPILegacy(data: any): Promise<TimbradoResponse> {
    try {
      logger.info('timbrado', 'Invocando edge function legacy (timbrar-con-sw)');
      
      const { data: result, error } = await supabase.functions.invoke('timbrar-con-sw', {
        body: {
          cartaPorteData: data,
          cartaPorteId: data.cartaPorteId || crypto.randomUUID(),
          ambiente: data.environment || 'sandbox'
        }
      });

      if (error) {
        logger.error('timbrado', 'Error en edge function legacy', error);
        throw new Error(error.message || 'Error llamando a función de timbrado legacy');
      }

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          codigo: result.codigo,
          details: result.details
        };
      }

      logger.info('timbrado', 'Timbrado exitoso con legacy', { uuid: result.uuid });

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
        pac: 'SW_LEGACY'
      };

    } catch (error) {
      logger.error('timbrado', 'Error en llamarFiscalAPILegacy', error);
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
    
    if (xml.includes('tfd:TimbreFiscalDigital')) {
      return xml.replace(
        /UUID="[^"]*"/,
        `UUID="${uuid}"`
      ).replace(
        /FechaTimbrado="[^"]*"/,
        `FechaTimbrado="${timestampActual}"`
      );
    }
    
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
      if (!xmlContent || xmlContent.trim().length === 0) {
        errors.push('El XML está vacío');
      }
      
      if (!xmlContent.includes('<cfdi:Comprobante')) {
        errors.push('El XML no es un CFDI válido');
      }
      
      if (!xmlContent.includes('cartaporte31:CartaPorte')) {
        errors.push('El XML no contiene complemento Carta Porte 3.1');
      }
      
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
      logger.info('timbrado', 'Validando conexión con PAC');
      
      const { data, error } = await supabase.functions.invoke('verificar-pac-config', {
        body: { ambiente: 'test' }
      });

      if (error) {
        logger.error('timbrado', 'Error invocando edge function', error);
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
        message: `Conexión con FISCAL API (${data.ambiente}) establecida correctamente`
      };
    } catch (error) {
      logger.error('timbrado', 'Error validando conexión PAC', error);
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
      logger.debug('db', 'Guardando datos de timbrado', { cartaPorteId });
      
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
      
      await this.incrementarContadorTimbres(cartaPorteId);
      await this.guardarXMLEnStorage(cartaPorteId, datos.xml_timbrado);
      
      logger.info('db', 'Datos de timbrado guardados exitosamente', { cartaPorteId });
      
    } catch (error) {
      logger.error('db', 'Error guardando datos de timbrado', error);
      throw error;
    }
  }

  /**
   * Incrementa el contador de timbres consumidos
   */
  private static async incrementarContadorTimbres(cartaPorteId: string) {
    try {
      const { data: carta } = await supabase
        .from('cartas_porte')
        .select('usuario_id')
        .eq('id', cartaPorteId)
        .single();
        
      if (!carta) return;
      
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
      
      logger.debug('db', 'Contador de timbres incrementado');
      
    } catch (error) {
      logger.error('db', 'Error incrementando contador de timbres', error);
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
      
      logger.debug('storage', 'XML guardado en Storage', { fileName });
      
    } catch (error) {
      logger.error('storage', 'Error guardando XML en Storage', error);
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
