
import { supabase } from '@/integrations/supabase/client';
import { multiplePACManager } from './pac/MultiplePACManager';
import { smartCacheManager } from './cache/SmartCacheManager';
import { monitoringService } from './monitoring/MonitoringService';

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
  provider?: string;
  responseTime?: number;
}

export class TimbradoService {
  static async timbrarCartaPorte(request: TimbradoRequest): Promise<TimbradoResponse> {
    const startTime = Date.now();
    
    try {
      console.log('Iniciando proceso de timbrado avanzado para Carta Porte:', request.cartaPorteId);

      // Check cache first for recent timbrado attempts
      const cacheKey = `timbrado:${request.cartaPorteId}`;
      const cachedResult = await smartCacheManager.get(cacheKey);
      
      if (cachedResult && cachedResult.success) {
        console.log('Timbrado encontrado en cache');
        return cachedResult;
      }

      // Validate XML before timbrado
      const validation = this.validateXMLAntesDelTimbrado(request.xml);
      if (!validation.isValid) {
        const error = `XML inválido: ${validation.errors.join(', ')}`;
        monitoringService.createAlert('error', 'medium', 'XML Validation Failed', error, 'timbrado');
        return { success: false, error };
      }

      // Use MultiplePACManager for robust timbrado with failover
      const result = await multiplePACManager.timbrarConFailover(
        this.formatearXMLParaTimbrado(request.xml),
        {
          ambiente: 'sandbox', // Change to 'production' when ready
          maxRetries: 3,
          timeoutMs: 30000
        }
      );

      const responseTime = Date.now() - startTime;
      
      if (result.success) {
        // Update carta porte in database
        await this.actualizarCartaPorteTimbrada(request.cartaPorteId, result);
        
        // Cache successful result
        await smartCacheManager.set(cacheKey, result, {
          ttl: 24 * 60 * 60 * 1000, // 24 hours
          tags: ['timbrado', 'persistent'],
          priority: 'high'
        });

        // Log success metrics
        monitoringService.createAlert('info', 'low', 'Timbrado Successful', 
          `Carta Porte ${request.cartaPorteId} timbrada exitosamente con ${result.provider}`, 
          'timbrado', {
            uuid: result.uuid,
            provider: result.provider,
            responseTime
          });

        return {
          success: true,
          uuid: result.uuid,
          xmlTimbrado: result.xmlTimbrado,
          qrCode: result.qrCode,
          cadenaOriginal: result.cadenaOriginal,
          selloDigital: result.selloDigital,
          folio: result.folio,
          provider: result.provider,
          responseTime
        };
      } else {
        // Log failure
        monitoringService.createAlert('error', 'high', 'Timbrado Failed', 
          `Error timbrado Carta Porte ${request.cartaPorteId}: ${result.error}`, 
          'timbrado', {
            error: result.error,
            attempts: result.totalAttempts,
            responseTime
          });

        return {
          success: false,
          error: result.error || 'Error desconocido en el timbrado',
          responseTime
        };
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      console.error('Error crítico en proceso de timbrado:', error);
      
      monitoringService.createAlert('error', 'critical', 'Timbrado Critical Error', 
        `Error crítico en timbrado: ${errorMessage}`, 'timbrado', {
          error: errorMessage,
          cartaPorteId: request.cartaPorteId,
          responseTime
        });

      return {
        success: false,
        error: `Error interno: ${errorMessage}`,
        responseTime
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

      // Invalidate related caches
      await smartCacheManager.invalidate(`carta_porte:${cartaPorteId}`);

      console.log('Carta porte actualizada exitosamente con datos de timbrado');
    } catch (error) {
      console.error('Error en actualizarCartaPorteTimbrada:', error);
      throw error;
    }
  }

  static async validarConexionPAC(): Promise<{ success: boolean; message: string }> {
    try {
      const providers = multiplePACManager.getProviderStatus();
      const healthyProviders = multiplePACManager.getHealthyProvidersCount();
      
      if (healthyProviders === 0) {
        return {
          success: false,
          message: 'No hay proveedores PAC disponibles. Verifique la configuración.'
        };
      }

      const providerStatus = providers
        .filter(p => p.isActive)
        .map(p => `${p.name}: ${p.healthStatus} (${p.successRate.toFixed(1)}%)`)
        .join(', ');

      return {
        success: true,
        message: `${healthyProviders} proveedores PAC disponibles. Estado: ${providerStatus}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Error validando conexión PAC: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  static async obtenerSaldoPAC(): Promise<{ success: boolean; saldo?: number; message?: string }> {
    try {
      // This would integrate with actual PAC balance APIs
      // For now, return mock data
      return {
        success: true,
        saldo: 1000,
        message: 'Saldo obtenido exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error consultando saldo: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  static async cancelarCFDI(uuid: string, motivoCancelacion: string): Promise<TimbradoResponse> {
    try {
      // This would integrate with PAC cancellation APIs
      // For now, return mock response
      monitoringService.createAlert('info', 'medium', 'CFDI Cancellation', 
        `CFDI ${uuid} cancelado por: ${motivoCancelacion}`, 'timbrado', { uuid, motivo: motivoCancelacion });

      return {
        success: true,
        uuid
      };
    } catch (error) {
      return {
        success: false,
        error: `Error en cancelación: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  static formatearXMLParaTimbrado(xml: string): string {
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

  // Performance monitoring methods
  static async getPerformanceMetrics(): Promise<any> {
    const providers = multiplePACManager.getProviderStatus();
    const cacheMetrics = smartCacheManager.getMetrics();
    
    return {
      pac_providers: {
        total: providers.length,
        healthy: providers.filter(p => p.healthStatus === 'healthy').length,
        average_response_time: providers.reduce((sum, p) => sum + p.responseTime, 0) / providers.length,
        average_success_rate: providers.reduce((sum, p) => sum + p.successRate, 0) / providers.length
      },
      cache: {
        hit_rate: cacheMetrics.hitRate,
        total_items: cacheMetrics.totalItems,
        memory_usage: cacheMetrics.memoryUsage
      }
    };
  }
}
