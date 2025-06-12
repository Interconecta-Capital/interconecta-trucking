
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class XMLValidatorSAT {
  static async validateCartaPorteCompliance(data: CartaPorteData): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar RFC emisor y receptor
    if (!this.validateRFC(data.rfcEmisor)) {
      errors.push('RFC emisor no válido según formato SAT');
    }
    
    if (!this.validateRFC(data.rfcReceptor)) {
      errors.push('RFC receptor no válido según formato SAT');
    }

    // Validar ubicaciones
    if (data.ubicaciones?.length < 2) {
      errors.push('Se requieren al menos 2 ubicaciones (origen y destino)');
    }

    // Validar códigos postales
    for (const ubicacion of data.ubicaciones || []) {
      if (!this.validateCodigoPostal(ubicacion.domicilio?.codigoPostal)) {
        errors.push(`Código postal inválido en ${ubicacion.tipoUbicacion}: ${ubicacion.domicilio?.codigoPostal}`);
      }
    }

    // Validar mercancías
    if (!data.mercancias?.length) {
      errors.push('Se requiere al menos una mercancía');
    }

    for (const mercancia of data.mercancias || []) {
      if (!mercancia.bienes_transp) {
        errors.push('Falta clave de producto/servicio en mercancía');
      }
      
      if (!mercancia.clave_unidad) {
        warnings.push('Se recomienda especificar clave de unidad para mercancía');
      }
    }

    // Validar autotransporte
    if (!data.autotransporte?.placaVm) {
      errors.push('Falta placa del vehículo motor');
    }

    if (!data.autotransporte?.config_vehicular) {
      errors.push('Falta configuración vehicular');
    }

    // Validar figuras
    if (!data.figuras?.length) {
      errors.push('Se requiere al menos una figura de transporte');
    }

    for (const figura of data.figuras || []) {
      if (!figura.tipo_figura) {
        errors.push('Falta tipo de figura de transporte');
      }
      
      if (!figura.rfc_figura) {
        errors.push('Falta RFC de figura de transporte');
      } else if (!this.validateRFC(figura.rfc_figura)) {
        errors.push(`RFC inválido en figura: ${figura.rfc_figura}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static validateRFC(rfc: string): boolean {
    if (!rfc) return false;
    
    // Validación básica de RFC mexicano
    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcPattern.test(rfc) && (rfc.length === 12 || rfc.length === 13);
  }

  private static validateCodigoPostal(cp: string): boolean {
    if (!cp) return false;
    
    // Validación básica de código postal mexicano
    const cpPattern = /^[0-9]{5}$/;
    return cpPattern.test(cp);
  }

  static validateXMLStructure(xml: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!xml.includes('xmlns:cfdi="http://www.sat.gob.mx/cfd/4"')) {
      errors.push('Falta namespace CFDI 4.0');
    }

    if (!xml.includes('xmlns:cartaporte31="http://www.sat.gob.mx/CartaPorte31"')) {
      errors.push('Falta namespace CartaPorte 3.1');
    }

    if (!xml.includes('Version="4.0"')) {
      errors.push('Falta versión CFDI 4.0');
    }

    if (!xml.includes('TipoDeComprobante="T"')) {
      warnings.push('Se recomienda tipo de comprobante "T" para traslado');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
