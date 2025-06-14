
import { supabase } from '@/integrations/supabase/client';

export interface TimbradoRequest {
  xmlContent: string;
  cartaPorteId: string;
  rfcEmisor: string;
}

export interface TimbradoResponse {
  success: boolean;
  uuid?: string;
  fechaTimbrado?: string;
  xmlTimbrado?: string;
  pdf?: Blob;
  qrCode?: string;
  cadenaOriginal?: string;
  selloDigital?: string;
  folio?: string;
  error?: string;
  details?: any;
}

export class TimbradoService {
  private static readonly TIMBRADO_ENDPOINT = 'timbrar-carta-porte';

  static validarXMLAntesDelTimbrado(xml: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!xml.trim()) {
      errors.push('El contenido XML está vacío');
    }

    if (!xml.includes('CartaPorte')) {
      errors.push('El XML no contiene el complemento CartaPorte');
    }

    if (!xml.includes('cfdi:Comprobante')) {
      errors.push('El XML no tiene la estructura de comprobante fiscal válida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static formatearXMLParaTimbrado(xml: string): string {
    // Formatear XML para timbrado, removiendo espacios innecesarios
    return xml.trim().replace(/>\s+</g, '><');
  }

  static async timbrarCartaPorte(request: TimbradoRequest): Promise<TimbradoResponse> {
    try {
      console.log('Iniciando proceso de timbrado:', {
        cartaPorteId: request.cartaPorteId,
        rfcEmisor: request.rfcEmisor,
        xmlLength: request.xmlContent.length
      });

      // Validar XML antes de enviar
      if (!request.xmlContent.trim()) {
        throw new Error('El contenido XML está vacío');
      }

      if (!request.xmlContent.includes('CartaPorte')) {
        throw new Error('El XML no contiene el complemento CartaPorte');
      }

      // Llamar a la función edge de Supabase
      const { data, error } = await supabase.functions.invoke(this.TIMBRADO_ENDPOINT, {
        body: {
          xmlContent: request.xmlContent,
          cartaPorteId: request.cartaPorteId,
          rfcEmisor: request.rfcEmisor
        }
      });

      if (error) {
        console.error('Error en timbrado:', error);
        throw new Error(`Error en el servicio de timbrado: ${error.message}`);
      }

      if (!data.success) {
        console.error('Timbrado falló:', data);
        return {
          success: false,
          error: data.error || 'Error desconocido en el timbrado',
          details: data.details
        };
      }

      // Procesar respuesta exitosa
      const response: TimbradoResponse = {
        success: true,
        uuid: data.uuid,
        fechaTimbrado: data.fechaTimbrado,
        xmlTimbrado: data.xmlTimbrado,
        qrCode: data.qrCode,
        cadenaOriginal: data.cadenaOriginal,
        selloDigital: data.selloDigital,
        folio: data.folio
      };

      // Convertir PDF base64 a Blob si existe
      if (data.pdfBase64) {
        try {
          const pdfBytes = atob(data.pdfBase64);
          const pdfArray = new Uint8Array(pdfBytes.length);
          for (let i = 0; i < pdfBytes.length; i++) {
            pdfArray[i] = pdfBytes.charCodeAt(i);
          }
          response.pdf = new Blob([pdfArray], { type: 'application/pdf' });
        } catch (pdfError) {
          console.warn('Error procesando PDF:', pdfError);
        }
      }

      console.log('Timbrado exitoso:', {
        uuid: response.uuid,
        fecha: response.fechaTimbrado
      });

      return response;

    } catch (error) {
      console.error('Error en timbrado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido en el timbrado'
      };
    }
  }

  static async validarConexionPAC(): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar conexión con el PAC
      const { data, error } = await supabase.functions.invoke('validar-pac');

      if (error) {
        return {
          success: false,
          message: `Error de conexión: ${error.message}`
        };
      }

      return {
        success: data?.success || false,
        message: data?.message || 'Conexión verificada'
      };
    } catch (error) {
      console.error('Error verificando conexión PAC:', error);
      return {
        success: false,
        message: 'Error interno verificando conexión'
      };
    }
  }

  static async verificarEstadoTimbrado(uuid: string): Promise<{ exists: boolean; status?: string }> {
    try {
      // Implementar verificación de estado con el SAT
      // Por ahora retornamos un mock
      return {
        exists: true,
        status: 'vigente'
      };
    } catch (error) {
      console.error('Error verificando estado de timbrado:', error);
      return { exists: false };
    }
  }

  static async cancelarTimbrado(uuid: string, motivo: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Implementar cancelación con el SAT
      // Por ahora retornamos un mock
      console.log('Cancelando timbrado:', { uuid, motivo });
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelando timbrado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}
