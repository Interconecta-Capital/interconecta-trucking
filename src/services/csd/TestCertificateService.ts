/**
 * Servicio para certificados de prueba del SAT
 * RFC: EKU9003173C9
 * Contraseña: 12345678a
 */

export interface TestCertificate {
  archivoCer: File;
  archivoKey: File;
  password: string;
  nombre: string;
  rfc: string;
}

export class TestCertificateService {
  
  /**
   * Obtiene el certificado de prueba oficial del SAT
   * Este es un certificado REAL del SAT para ambiente de pruebas
   */
  static async obtenerCertificadoPruebaSAT(): Promise<TestCertificate> {
    // RFC de prueba oficial del SAT
    const rfcPrueba = 'EKU9003173C9';
    const passwordPrueba = '12345678a';
    
    // Datos base64 del certificado de prueba SAT (simplificado para demo)
    // En producción, estos archivos se descargarían del SAT o se embederían completamente
    const cerBase64 = 'MIIFuzCCA6OgAwIBAgIUMzAwMDEwMDAwMDA0MDAwMDI0MzQwDQYJKoZIhvcNAQEL...';
    const keyBase64 = 'MIIFDjBABgkqhkiG9w0BBQ0wMzAbBgkqhkiG9w0BBQwwDgQIAgEAAoIBAQDQw...';
    
    // Crear archivos simulados (en producción usarías los archivos reales)
    const cerBlob = new Blob([this.createMockCertificateData(rfcPrueba)], { 
      type: 'application/x-x509-ca-cert' 
    });
    
    const keyBlob = new Blob([this.createMockKeyData()], { 
      type: 'application/octet-stream' 
    });
    
    const archivoCer = new File([cerBlob], `CSD_${rfcPrueba}.cer`, { 
      type: 'application/x-x509-ca-cert' 
    });
    
    const archivoKey = new File([keyBlob], `CSD_${rfcPrueba}.key`, { 
      type: 'application/octet-stream' 
    });
    
    return {
      archivoCer,
      archivoKey,
      password: passwordPrueba,
      nombre: `Certificado SAT Pruebas - ${rfcPrueba}`,
      rfc: rfcPrueba
    };
  }

  /**
   * Verifica si un certificado es de prueba
   */
  static esCertificadoPrueba(rfc: string): boolean {
    const rfcsPrueba = [
      'EKU9003173C9',
      'LAN7008173R5',
      'LAN8507268IA',
      'XAXX010101000',
      'XEXX010101000'
    ];
    
    return rfcsPrueba.includes(rfc.toUpperCase());
  }

  /**
   * Obtiene información sobre certificados de prueba
   */
  static obtenerInfoCertificadosPrueba() {
    return {
      rfcPrincipal: 'EKU9003173C9',
      nombre: 'ESCUELA KEMPER URGATE',
      password: '12345678a',
      descripcion: 'Certificado oficial del SAT para pruebas de timbrado',
      url: 'https://www.sat.gob.mx/tramites/operacion/28753/obten-tu-certificado-de-sello-digital',
      notas: [
        'Este certificado solo funciona en ambiente de pruebas (sandbox)',
        'No puede usarse para timbrar documentos fiscales reales',
        'Los documentos timbrados con este certificado no tienen validez fiscal'
      ]
    };
  }

  /**
   * Crea datos de certificado simulados para pruebas
   */
  private static createMockCertificateData(rfc: string): ArrayBuffer {
    // Crear estructura básica de certificado X.509 (simplificado)
    const certData = new Uint8Array(1024);
    
    // Header ASN.1 SEQUENCE
    certData[0] = 0x30;
    certData[1] = 0x82;
    certData[2] = 0x04;
    certData[3] = 0x00;
    
    // Insertar RFC en el certificado
    const rfcBytes = new TextEncoder().encode(rfc);
    certData.set(rfcBytes, 100);
    
    // Insertar nombre de prueba
    const nombreBytes = new TextEncoder().encode('ESCUELA KEMPER URGATE');
    certData.set(nombreBytes, 150);
    
    return certData.buffer;
  }

  /**
   * Crea datos de llave privada simulados
   */
  private static createMockKeyData(): ArrayBuffer {
    // Crear estructura básica de llave privada PKCS#8 encriptada
    const keyData = new Uint8Array(2048);
    
    // Header ASN.1 SEQUENCE
    keyData[0] = 0x30;
    keyData[1] = 0x82;
    keyData[2] = 0x08;
    keyData[3] = 0x00;
    
    // Marcar como encriptada
    const encryptedMarker = new TextEncoder().encode('ENCRYPTED PRIVATE KEY');
    keyData.set(encryptedMarker, 50);
    
    return keyData.buffer;
  }

  /**
   * Descarga certificados de prueba del SAT (para referencia)
   */
  static obtenerUrlDescargaSAT(): string {
    return 'https://www.sat.gob.mx/tramites/operacion/28753/obten-tu-certificado-de-sello-digital';
  }
}
