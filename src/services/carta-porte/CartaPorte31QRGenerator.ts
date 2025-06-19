export interface QRCodeData31 {
  uuid: string;
  fechaOrigen: string;
  fechaTimbrado: string;
  idCCP: string;
}

export class CartaPorte31QRGenerator {
  
  // Generar código QR según especificaciones v3.1
  static generateQRCode31(data: QRCodeData31): string {
    // Validar que el IdCCP tenga 36 caracteres (RFC 4122)
    if (!data.idCCP || data.idCCP.length !== 36) {
      throw new Error('IdCCP debe tener exactamente 36 caracteres según RFC 4122 para versión 3.1');
    }

    // Validar formato de fechas
    if (!this.isValidDateTimeFormat(data.fechaOrigen)) {
      throw new Error('fechaOrigen debe tener formato AAAA-MM-DDTHH:MM:SS');
    }

    if (!this.isValidDateTimeFormat(data.fechaTimbrado)) {
      throw new Error('fechaTimbrado debe tener formato AAAA-MM-DDTHH:MM:SS');
    }

    // Construir URL según especificaciones v3.1
    const baseUrl = 'https://verificacfdi.facturaelectronica.sat.gob.mx/verificaccp/default.aspx';
    const params = new URLSearchParams({
      IdCCP: data.idCCP,
      FechaOrig: data.fechaOrigen,
      FechaTimb: data.fechaTimbrado
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Generar IdCCP válido para v3.1 (36 caracteres RFC 4122)
  static generateIdCCP31(): string {
    // Usar el servicio UUID centralizado
    const UUIDService = require('@/services/uuid/UUIDService').UUIDService;
    return UUIDService.generateValidIdCCP();
  }

  private static isValidDateTimeFormat(dateTime: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
    return regex.test(dateTime);
  }

  // Validar estructura completa del QR generado
  static validateQRStructure31(qrUrl: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const url = new URL(qrUrl);
      
      if (!url.hostname.includes('sat.gob.mx')) {
        errors.push('URL debe apuntar al dominio del SAT');
      }

      const idCCP = url.searchParams.get('IdCCP');
      if (!idCCP || idCCP.length !== 36) {
        errors.push('IdCCP debe tener 36 caracteres');
      }

      const fechaOrig = url.searchParams.get('FechaOrig');
      if (!fechaOrig || !this.isValidDateTimeFormat(fechaOrig)) {
        errors.push('FechaOrig debe tener formato válido AAAA-MM-DDTHH:MM:SS');
      }

      const fechaTimb = url.searchParams.get('FechaTimb');
      if (!fechaTimb || !this.isValidDateTimeFormat(fechaTimb)) {
        errors.push('FechaTimb debe tener formato válido AAAA-MM-DDTHH:MM:SS');
      }

    } catch (error) {
      errors.push('URL del código QR es inválida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
