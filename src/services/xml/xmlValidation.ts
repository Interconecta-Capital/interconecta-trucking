
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { SATValidation } from '@/utils/satValidation';

export interface XMLValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class XMLValidation {
  static async validateCartaPorteData(data: CartaPorteData): Promise<XMLValidationResult> {
    try {
      const erroresValidacion = await SATValidation.validarCartaPorteCompleta(data);
      const errors = erroresValidacion
        .filter(e => !e.isValid)
        .flatMap(e => e.errors);

      return {
        isValid: errors.length === 0,
        errors,
        warnings: this.getWarnings(data)
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Error en validación: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        warnings: []
      };
    }
  }

  private static getWarnings(data: CartaPorteData): string[] {
    const warnings: string[] = [];
    
    if (!data.mercancias || data.mercancias.length === 0) {
      warnings.push('No se han especificado mercancías');
    }
    
    if (!data.ubicaciones || data.ubicaciones.length < 2) {
      warnings.push('Se requieren al menos 2 ubicaciones (origen y destino)');
    }
    
    if (!data.figuras || data.figuras.length === 0) {
      warnings.push('No se han especificado figuras de transporte');
    }
    
    return warnings;
  }
}
