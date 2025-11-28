
import { CertificadoInfo, CSDValidationResult } from '@/types/certificados';
import { supabase } from '@/integrations/supabase/client';

export class CertificateParserService {
  
  /**
   * Parsea un archivo .cer para extraer información del certificado
   */
  static async parseCertificateFile(cerFile: File): Promise<CertificadoInfo> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const certificateInfo = await this.extractCertificateInfo(arrayBuffer);
          resolve(certificateInfo);
        } catch (error) {
          reject(new Error('Error al parsear certificado: ' + error));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer archivo de certificado'));
      };
      
      reader.readAsArrayBuffer(cerFile);
    });
  }

  /**
   * Extrae información del certificado desde el ArrayBuffer
   */
  private static async extractCertificateInfo(arrayBuffer: ArrayBuffer): Promise<CertificadoInfo> {
    try {
      // Convertir ArrayBuffer a base64 para procesamiento
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
      const base64 = btoa(binaryString);
      
      // Simular extracción de datos del certificado
      // En una implementación real, aquí usarías una librería como node-forge
      // o enviarías el certificado a un servicio backend para procesarlo
      
      const mockCertInfo: CertificadoInfo = {
        numeroSerie: this.generateMockSerialNumber(),
        rfc: this.extractMockRFC(base64),
        razonSocial: this.extractMockRazonSocial(base64),
        fechaInicioVigencia: new Date(),
        fechaFinVigencia: new Date(Date.now() + (4 * 365 * 24 * 60 * 60 * 1000)), // 4 años
        esValido: true
      };
      
      return mockCertInfo;
    } catch (error) {
      throw new Error('Error al extraer información del certificado');
    }
  }

  private static RFC_PRUEBA_SAT = [
    'EKU9003173C9', // Escuela Kemper Urgate (OFICIAL SAT)
    'LAN7008173R5', // Lan Cargo S.A. de C.V. (OFICIAL SAT)
    'LAN8507268IA'  // Lanix S.A. de C.V. (OFICIAL SAT)
  ];

  /**
   * Verifica si un RFC pertenece a los certificados de prueba del SAT
   * Solo los superusuarios pueden usar estos certificados
   */
  static esCertificadoDePrueba(rfc: string): boolean {
    return this.RFC_PRUEBA_SAT.includes(rfc.toUpperCase());
  }

  /**
   * Valida un certificado digital completo usando el edge function
   */
  static async validateCertificate(
    cerFile: File, 
    keyFile: File, 
    password: string
  ): Promise<CSDValidationResult> {
    const errors: string[] = [];
    
    try {
      console.log('🔐 Validando certificado con edge function...');
      
      // Validar archivos localmente primero
      const fileErrors = this.validateFiles(cerFile, keyFile);
      errors.push(...fileErrors);
      
      if (errors.length > 0) {
        return { isValid: false, errors };
      }
      
      // Obtener JWT del usuario autenticado
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        errors.push('Sesión expirada. Por favor inicia sesión nuevamente.');
        return { isValid: false, errors };
      }

      // Llamar al edge function para validación REAL
      const formData = new FormData();
      formData.append('cer_file', cerFile);
      formData.append('key_file', keyFile);
      formData.append('password', password);
      
      const response = await fetch(
        `https://qulhweffinppyjpfkknh.supabase.co/functions/v1/validar-certificado`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.isValid) {
        errors.push(result.error || result.message || 'Error al validar certificado');
        return { isValid: false, errors };
      }

      console.log('✅ Certificado validado exitosamente');
      
      return {
        isValid: true,
        errors: [],
        certificateInfo: {
          numeroSerie: result.certificateInfo.numeroSerie,
          rfc: result.certificateInfo.rfc,
          razonSocial: result.certificateInfo.razonSocial,
          fechaInicioVigencia: new Date(result.certificateInfo.fechaInicioVigencia),
          fechaFinVigencia: new Date(result.certificateInfo.fechaFinVigencia),
          esValido: result.certificateInfo.esValido
        }
      };
      
    } catch (error) {
      console.error('❌ Error en validación de certificado:', error);
      errors.push(error instanceof Error ? error.message : 'Error de red al validar certificado');
      return { isValid: false, errors };
    }
  }

  /**
   * Valida los archivos de certificado
   */
  private static validateFiles(cerFile: File, keyFile: File): string[] {
    const errors: string[] = [];
    
    if (!cerFile.name.toLowerCase().endsWith('.cer')) {
      errors.push('El archivo de certificado debe tener extensión .cer');
    }
    
    if (!keyFile.name.toLowerCase().endsWith('.key')) {
      errors.push('El archivo de llave debe tener extensión .key');
    }
    
    if (cerFile.size === 0) {
      errors.push('El archivo .cer está vacío');
    }
    
    if (keyFile.size === 0) {
      errors.push('El archivo .key está vacío');
    }
    
    return errors;
  }

  /**
   * Verifica si un certificado está vigente
   */
  private static isCertificateValid(certificateInfo: CertificadoInfo): boolean {
    const now = new Date();
    return now >= certificateInfo.fechaInicioVigencia && 
           now <= certificateInfo.fechaFinVigencia;
  }

  /**
   * Valida la contraseña de la llave privada (simulado)
   */
  private static validatePassword(password: string): boolean {
    // En una implementación real, aquí validarías que la contraseña
    // puede desencriptar la llave privada
    return password.length >= 4;
  }

  // Métodos auxiliares para simular extracción de datos
  private static generateMockSerialNumber(): string {
    return Date.now().toString(16).toUpperCase().slice(-16);
  }

  private static extractMockRFC(base64: string): string {
    // Simular extracción de RFC
    return 'XAXX010101000';
  }

  private static extractMockRazonSocial(base64: string): string {
    // Simular extracción de razón social
    return 'EMPRESA DE PRUEBA SA DE CV';
  }
}
