import { supabase } from '@/integrations/supabase/client';

export interface CertificadoValidation {
  isValid: boolean;
  certificadoActivo: boolean;
  certificadoVigente: boolean;
  diasRestantes?: number;
  error?: string;
}

/**
 * Validador de certificados CSD para timbrado
 */
export class CertificadoValidator {
  /**
   * Validar que el usuario tenga un certificado CSD activo y vigente
   */
  static async validarCertificadoParaTimbrado(userId: string): Promise<CertificadoValidation> {
    try {
      console.log('🔍 Validando certificado CSD para usuario:', userId);

      // Obtener certificado activo del usuario
      const { data: certificadoActivo, error } = await supabase
        .rpc('get_active_certificate', { user_uuid: userId });

      if (error) {
        console.error('Error obteniendo certificado:', error);
        return {
          isValid: false,
          certificadoActivo: false,
          certificadoVigente: false,
          error: 'Error al verificar certificado'
        };
      }

      // No hay certificado activo
      if (!certificadoActivo || certificadoActivo.length === 0) {
        console.warn('❌ Usuario sin certificado CSD activo');
        return {
          isValid: false,
          certificadoActivo: false,
          certificadoVigente: false,
          error: 'No se encontró un certificado CSD activo. Debe cargar un certificado válido en la configuración.'
        };
      }

      const certificado = certificadoActivo[0];

      // Validar vigencia
      const fechaFin = new Date(certificado.fecha_fin_vigencia);
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      if (diasRestantes <= 0) {
        console.warn('❌ Certificado CSD vencido');
        return {
          isValid: false,
          certificadoActivo: true,
          certificadoVigente: false,
          diasRestantes,
          error: 'El certificado CSD está vencido. Debe renovarlo para poder timbrar.'
        };
      }

      if (diasRestantes <= 7) {
        console.warn('⚠️ Certificado CSD próximo a vencer');
        return {
          isValid: true,
          certificadoActivo: true,
          certificadoVigente: true,
          diasRestantes,
          error: `Advertencia: El certificado vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}. Considere renovarlo pronto.`
        };
      }

      console.log(`✅ Certificado CSD válido (${diasRestantes} días restantes)`);
      return {
        isValid: true,
        certificadoActivo: true,
        certificadoVigente: true,
        diasRestantes
      };

    } catch (error) {
      console.error('💥 Error validando certificado:', error);
      return {
        isValid: false,
        certificadoActivo: false,
        certificadoVigente: false,
        error: 'Error interno al validar certificado'
      };
    }
  }

  /**
   * Obtener información del certificado activo
   */
  static async obtenerCertificadoActivo(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_active_certificate', { user_uuid: userId });

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error obteniendo certificado activo:', error);
      return null;
    }
  }
}
