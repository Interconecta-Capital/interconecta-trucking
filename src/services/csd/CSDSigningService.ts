
import { supabase } from '@/integrations/supabase/client';
import { CertificadoDigital } from '@/types/certificados';
import { CSDService } from './CSDService';

export interface XMLSigningResult {
  success: boolean;
  xmlFirmado?: string;
  error?: string;
  certificadoUsado?: {
    numero: string;
    rfc: string;
    nombre: string;
  };
}

export class CSDSigningService {
  
  /**
   * Firma un XML con el certificado activo del usuario
   */
  static async firmarXML(xmlContent: string): Promise<XMLSigningResult> {
    try {
      console.log('Iniciando proceso de firmado XML...');
      
      // Obtener certificado activo
      const certificadoActivo = await CSDService.getActiveCertificate();
      if (!certificadoActivo) {
        return {
          success: false,
          error: 'No hay un certificado digital activo. Por favor activa un certificado válido.'
        };
      }

      // Validar que el certificado esté vigente
      if (!CSDService.isCertificateValid(certificadoActivo)) {
        return {
          success: false,
          error: 'El certificado activo no está vigente o no es válido.'
        };
      }

      // Descargar archivos del certificado
      const { archivoCer, archivoKey } = await this.descargarArchivosCertificado(certificadoActivo);

      // Generar cadena original del XML
      const cadenaOriginal = this.generarCadenaOriginal(xmlContent);
      
      // Simular firmado (en producción aquí iría la lógica real de firmado)
      const selloDigital = await this.generarSelloDigital(cadenaOriginal, archivoKey);
      
      // Insertar sello en el XML
      const xmlFirmado = this.insertarSelloEnXML(xmlContent, selloDigital, certificadoActivo);

      console.log('XML firmado exitosamente');
      
      return {
        success: true,
        xmlFirmado,
        certificadoUsado: {
          numero: certificadoActivo.numero_certificado,
          rfc: certificadoActivo.rfc_titular,
          nombre: certificadoActivo.nombre_certificado
        }
      };

    } catch (error) {
      console.error('Error en firmado XML:', error);
      return {
        success: false,
        error: `Error al firmar XML: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Descarga los archivos .cer y .key del certificado
   */
  private static async descargarArchivosCertificado(certificado: CertificadoDigital): Promise<{
    archivoCer: Blob;
    archivoKey: Blob;
  }> {
    const { data: cerData, error: cerError } = await supabase.storage
      .from('certificados')
      .download(certificado.archivo_cer_path);

    if (cerError) {
      throw new Error(`Error descargando archivo .cer: ${cerError.message}`);
    }

    const { data: keyData, error: keyError } = await supabase.storage
      .from('certificados')
      .download(certificado.archivo_key_path);

    if (keyError) {
      throw new Error(`Error descargando archivo .key: ${keyError.message}`);
    }

    return {
      archivoCer: cerData,
      archivoKey: keyData
    };
  }

  /**
   * Genera la cadena original del XML según especificaciones SAT
   */
  private static generarCadenaOriginal(xmlContent: string): string {
    // En una implementación real, aquí se aplicaría la transformación XSLT
    // para generar la cadena original según las especificaciones del SAT
    
    // Por ahora simulamos la generación
    const timestamp = new Date().toISOString();
    const mockCadenaOriginal = `||3.1|${timestamp}|${xmlContent.length}||`;
    
    console.log('Cadena original generada:', mockCadenaOriginal);
    return mockCadenaOriginal;
  }

  /**
   * Genera el sello digital usando la llave privada
   */
  private static async generarSelloDigital(cadenaOriginal: string, archivoKey: Blob): Promise<string> {
    // En una implementación real, aquí se usaría la llave privada para firmar
    // la cadena original y generar el sello digital
    
    // Por ahora simulamos la generación del sello
    const mockSello = btoa(cadenaOriginal + '_' + Date.now()).substring(0, 172);
    
    console.log('Sello digital generado');
    return mockSello;
  }

  /**
   * Inserta el sello digital en el XML
   */
  private static insertarSelloEnXML(
    xmlContent: string, 
    selloDigital: string, 
    certificado: CertificadoDigital
  ): string {
    // Buscar la etiqueta de cierre del comprobante para insertar el sello
    const timestampActual = new Date().toISOString();
    
    // Generar certificado base64 (simulado)
    const certificadoBase64 = btoa(`CERT_${certificado.numero_certificado}_${Date.now()}`);
    
    // Construir el complemento TimbreFiscalDigital
    const timbreFiscal = `
  <tfd:TimbreFiscalDigital 
    xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" 
    xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd"
    Version="1.1"
    UUID="${this.generarUUID()}"
    FechaTimbrado="${timestampActual}"
    RfcProvCertif="${certificado.rfc_titular}"
    SelloCFD="${selloDigital}"
    NoCertificadoSAT="${certificado.numero_certificado}"
    SelloSAT="${selloDigital}"
    />`;

    // Insertar atributos en el comprobante principal
    let xmlFirmado = xmlContent.replace(
      '<cfdi:Comprobante',
      `<cfdi:Comprobante Certificado="${certificadoBase64}" NoCertificado="${certificado.numero_certificado}" Sello="${selloDigital}"`
    );

    // Insertar TimbreFiscalDigital en el complemento
    xmlFirmado = xmlFirmado.replace(
      '</cfdi:Complemento>',
      `${timbreFiscal}
  </cfdi:Complemento>`
    );

    return xmlFirmado;
  }

  /**
   * Genera un UUID simulado para el TimbreFiscalDigital
   */
  private static generarUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Valida que un XML esté correctamente firmado
   */
  static async validarXMLFirmado(xmlContent: string): Promise<{
    esValido: boolean;
    errores: string[];
    certificadoInfo?: {
      numero: string;
      rfc: string;
      uuid?: string;
    };
  }> {
    const errores: string[] = [];
    
    try {
      // Verificar que contenga sello
      if (!xmlContent.includes('Sello=')) {
        errores.push('El XML no contiene sello digital');
      }

      // Verificar que contenga certificado
      if (!xmlContent.includes('Certificado=')) {
        errores.push('El XML no contiene certificado digital');
      }

      // Verificar TimbreFiscalDigital
      if (!xmlContent.includes('tfd:TimbreFiscalDigital')) {
        errores.push('El XML no contiene TimbreFiscalDigital');
      }

      // Extraer información del certificado (simulado)
      const certificadoInfo = this.extraerInfoCertificado(xmlContent);

      return {
        esValido: errores.length === 0,
        errores,
        certificadoInfo
      };

    } catch (error) {
      errores.push(`Error validando XML: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return {
        esValido: false,
        errores
      };
    }
  }

  /**
   * Extrae información del certificado del XML firmado
   */
  private static extraerInfoCertificado(xmlContent: string): {
    numero: string;
    rfc: string;
    uuid?: string;
  } {
    // Extraer número de certificado
    const noCertMatch = xmlContent.match(/NoCertificado="([^"]+)"/);
    const numero = noCertMatch ? noCertMatch[1] : 'No encontrado';

    // Extraer RFC del proveedor
    const rfcMatch = xmlContent.match(/RfcProvCertif="([^"]+)"/);
    const rfc = rfcMatch ? rfcMatch[1] : 'No encontrado';

    // Extraer UUID
    const uuidMatch = xmlContent.match(/UUID="([^"]+)"/);
    const uuid = uuidMatch ? uuidMatch[1] : undefined;

    return { numero, rfc, uuid };
  }
}
