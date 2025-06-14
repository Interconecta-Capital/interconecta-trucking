
import { CartaPorteData } from '@/types/cartaPorte';

export const validateCartaPorteData = (data: CartaPorteData): string[] => {
  const errors: string[] = [];

  if (!data.rfcEmisor) {
    errors.push('RFC Emisor es requerido');
  }

  if (!data.rfcReceptor) {
    errors.push('RFC Receptor es requerido');
  }

  return errors;
};

export const validateUbicaciones = (ubicaciones: any[]): string[] => {
  const errors: string[] = [];
  
  ubicaciones.forEach((ubicacion, index) => {
    if (!ubicacion.domicilio?.codigo_postal) {
      errors.push(`Ubicación ${index + 1}: Código postal requerido`);
    }
    
    if (ubicacion.tipo_ubicacion === 'Origen' && !ubicacion.domicilio?.codigo_postal) {
      errors.push(`Ubicación origen: Código postal es obligatorio`);
    }
  });
  
  return errors;
};

export class XMLValidatorSAT {
  static async validateCartaPorteCompliance(data: CartaPorteData) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic required fields
    errors.push(...validateCartaPorteData(data));
    
    // Validate ubicaciones
    if (data.ubicaciones) {
      errors.push(...validateUbicaciones(data.ubicaciones));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateXMLStructure(xml: string) {
    const errors: string[] = [];
    
    if (!xml.includes('<?xml')) {
      errors.push('XML declaration missing');
    }
    
    if (!xml.includes('cfdi:Comprobante')) {
      errors.push('CFDI Comprobante element missing');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
