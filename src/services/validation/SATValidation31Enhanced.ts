
import { CartaPorte31Data, ValidationResult } from '@/types/validationTypes';

export class SATValidation31Enhanced {
  static async validarCompleta(data: CartaPorte31Data): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validaciones básicas
    if (!data.rfcEmisor) {
      errors.push('RFC del emisor es requerido');
    }
    
    if (!data.rfcReceptor) {
      errors.push('RFC del receptor es requerido');
    }
    
    if (!data.mercancias || data.mercancias.length === 0) {
      errors.push('Se requiere al menos una mercancía');
    }
    
    if (!data.ubicaciones || data.ubicaciones.length < 2) {
      errors.push('Se requieren al menos 2 ubicaciones (origen y destino)');
    }
    
    // Validar mercancías
    data.mercancias?.forEach((mercancia, index) => {
      if (!mercancia.descripcion) {
        errors.push(`Descripción requerida en mercancía ${index + 1}`);
      }
      if (!mercancia.cantidad || mercancia.cantidad <= 0) {
        errors.push(`Cantidad debe ser mayor a 0 en mercancía ${index + 1}`);
      }
      if (!mercancia.clave_unidad) {
        errors.push(`Clave de unidad requerida en mercancía ${index + 1}`);
      }
      if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
        errors.push(`Peso debe ser mayor a 0 en mercancía ${index + 1}`);
      }
    });
    
    // Validar ubicaciones
    data.ubicaciones?.forEach((ubicacion, index) => {
      if (!ubicacion.id_ubicacion) {
        errors.push(`ID de ubicación requerido en ubicación ${index + 1}`);
      }
      if (!ubicacion.domicilio?.codigo_postal) {
        errors.push(`Código postal requerido en ubicación ${index + 1}`);
      }
    });
    
    // Validar autotransporte si existe
    if (data.autotransporte) {
      if (!data.autotransporte.placa_vm) {
        errors.push('Placa del vehículo motor es requerida');
      }
      if (!data.autotransporte.config_vehicular) {
        errors.push('Configuración vehicular es requerida');
      }
    }
    
    const score = errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 10));
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }
  
  static async validarTransporteInternacional(data: CartaPorte31Data): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (data.transporteInternacional) {
      if (!data.version31Fields?.registroISTMO) {
        warnings.push('Se recomienda registro ISTMO para transporte internacional');
      }
      
      // Validaciones específicas para transporte internacional
      data.mercancias?.forEach((mercancia, index) => {
        if (!mercancia.fraccion_arancelaria) {
          errors.push(`Fracción arancelaria requerida para transporte internacional en mercancía ${index + 1}`);
        }
      });
    }
    
    const score = errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 15));
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }
}
