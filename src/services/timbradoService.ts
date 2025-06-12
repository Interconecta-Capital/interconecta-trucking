
import { supabase } from '@/integrations/supabase/client';

export interface TimbradoRequest {
  xml: string;
  cartaPorteId: string;
  rfcEmisor: string;
  rfcReceptor: string;
}

export interface TimbradoResponse {
  success: boolean;
  uuid?: string;
  xmlTimbrado?: string;
  qrCode?: string;
  cadenaOriginal?: string;
  selloDigital?: string;
  error?: string;
  folio?: string;
}

export interface ProveedorConfig {
  nombre: string;
  url: string;
  usuario: string;
  password: string;
  produccion: boolean;
}

export class TimbradoService {
  private static readonly PROVIDERS = {
    FINKOK: 'finkok',
    STAMPED: 'stamped',
    PAC_DEMO: 'pac_demo'
  };

  static async timbrarCartaPorte(request: TimbradoRequest): Promise<TimbradoResponse> {
    try {
      console.log('Iniciando proceso de timbrado para Carta Porte:', request.cartaPorteId);

      // Preparar datos para el timbrado
      const timbradoData = {
        xml: request.xml,
        carta_porte_id: request.cartaPorteId,
        rfc_emisor: request.rfcEmisor,
        rfc_receptor: request.rfcReceptor
      };

      // Llamar a la edge function de timbrado
      const { data, error } = await supabase.functions.invoke('timbrar-carta-porte', {
        body: timbradoData
      });

      if (error) {
        console.error('Error en edge function de timbrado:', error);
        return {
          success: false,
          error: `Error del servicio de timbrado: ${error.message}`
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Error desconocido en el timbrado'
        };
      }

      // Actualizar la carta porte con los datos del timbrado
      await this.actualizarCartaPorteTimbrada(request.cartaPorteId, data);

      return {
        success: true,
        uuid: data.uuid,
        xmlTimbrado: data.xmlTimbrado,
        qrCode: data.qrCode,
        cadenaOriginal: data.cadenaOriginal,
        selloDigital: data.selloDigital,
        folio: data.folio
      };

    } catch (error) {
      console.error('Error en proceso de timbrado:', error);
      return {
        success: false,
        error: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  private static async actualizarCartaPorteTimbrada(cartaPorteId: string, datosTimbre: any) {
    try {
      const { error } = await supabase
        .from('cartas_porte')
        .update({
          status: 'timbrado',
          uuid_fiscal: datosTimbre.uuid,
          xml_generado: datosTimbre.xmlTimbrado,
          fecha_timbrado: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', cartaPorteId);

      if (error) {
        console.error('Error actualizando carta porte timbrada:', error);
        throw error;
      }

      console.log('Carta porte actualizada exitosamente con datos de timbrado');
    } catch (error) {
      console.error('Error en actualizarCartaPorteTimbrada:', error);
      throw error;
    }
  }

  static async validarConexionPAC(): Promise<{ success: boolean; message: string }> {
    try {
      // Llamar a edge function para validar conexión con PAC
      const { data, error } = await supabase.functions.invoke('validar-pac', {
        body: { action: 'test_connection' }
      });

      if (error) {
        return {
          success: false,
          message: `Error de conexión: ${error.message}`
        };
      }

      return {
        success: data.success,
        message: data.message || (data.success ? 'Conexión exitosa' : 'Error en la validación')
      };
    } catch (error) {
      return {
        success: false,
        message: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  static async obtenerSaldoPAC(): Promise<{ success: boolean; saldo?: number; message?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('consultar-saldo-pac', {
        body: { action: 'get_balance' }
      });

      if (error) {
        return {
          success: false,
          message: `Error consultando saldo: ${error.message}`
        };
      }

      return {
        success: data.success,
        saldo: data.saldo,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  static async cancelarCFDI(uuid: string, motivoCancelacion: string): Promise<TimbradoResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('cancelar-cfdi', {
        body: {
          uuid,
          motivo_cancelacion: motivoCancelacion
        }
      });

      if (error) {
        return {
          success: false,
          error: `Error en cancelación: ${error.message}`
        };
      }

      return {
        success: data.success,
        error: data.error
      };
    } catch (error) {
      return {
        success: false,
        error: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  static formatearXMLParaTimbrado(xml: string): string {
    // Limpiar y formatear XML antes del timbrado
    return xml
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }

  static validarXMLAntesDelTimbrado(xml: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!xml || xml.trim().length === 0) {
      errors.push('XML vacío o inválido');
    }

    if (!xml.includes('cfdi:Comprobante')) {
      errors.push('XML no contiene elemento Comprobante');
    }

    if (!xml.includes('cartaporte31:CartaPorte')) {
      errors.push('XML no contiene complemento CartaPorte');
    }

    if (!xml.includes('Version="3.1"')) {
      errors.push('XML no especifica versión 3.1 de CartaPorte');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
