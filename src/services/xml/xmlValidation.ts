
import { CartaPorteData } from '@/types/cartaPorte';
import { XMLUtils } from './xmlUtils';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class XMLValidation {
  static async validateCartaPorteData(data: CartaPorteData): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validaciones básicas
    if (!data.rfcEmisor) {
      errors.push('RFC del emisor es requerido');
    } else if (!XMLUtils.validarRFC(data.rfcEmisor)) {
      errors.push('RFC del emisor no tiene formato válido');
    }

    if (!data.nombreEmisor) {
      errors.push('Nombre del emisor es requerido');
    }

    if (!data.rfcReceptor) {
      errors.push('RFC del receptor es requerido');
    } else if (!XMLUtils.validarRFC(data.rfcReceptor)) {
      errors.push('RFC del receptor no tiene formato válido');
    }

    if (!data.nombreReceptor) {
      errors.push('Nombre del receptor es requerido');
    }

    // Validar ubicaciones
    if (!data.ubicaciones || data.ubicaciones.length < 2) {
      errors.push('Se requieren al menos 2 ubicaciones (origen y destino)');
    }

    // Validar mercancías
    if (!data.mercancias || data.mercancias.length === 0) {
      errors.push('Se requiere al menos una mercancía');
    } else {
      data.mercancias.forEach((mercancia, index) => {
        if (!mercancia.bienes_transp) {
          errors.push(`Mercancía ${index + 1}: Clave de producto/servicio es requerida`);
        }
        if (!mercancia.descripcion) {
          errors.push(`Mercancía ${index + 1}: Descripción es requerida`);
        }
        if (!mercancia.cantidad || mercancia.cantidad <= 0) {
          errors.push(`Mercancía ${index + 1}: Cantidad debe ser mayor a 0`);
        }
        if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
          errors.push(`Mercancía ${index + 1}: Peso debe ser mayor a 0`);
        }
      });
    }

    // Validar autotransporte
    if (!data.autotransporte?.placa_vm) {
      errors.push('La placa del vehículo es requerida');
    }

    // Validar figuras
    if (!data.figuras || data.figuras.length === 0) {
      errors.push('Se requiere al menos una figura de transporte');
    } else {
      data.figuras.forEach((figura, index) => {
        if (!figura.rfc_figura) {
          errors.push(`Figura ${index + 1}: RFC es requerido`);
        } else if (!XMLUtils.validarRFC(figura.rfc_figura)) {
          errors.push(`Figura ${index + 1}: RFC no tiene formato válido`);
        }
        if (!figura.nombre_figura) {
          errors.push(`Figura ${index + 1}: Nombre es requerido`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
