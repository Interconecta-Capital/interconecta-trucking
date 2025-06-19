
// Tipos para resultados de validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Basic SAT validation class for backward compatibility
export class SATValidation {
  static validarRFC(rfc: string): ValidationResult {
    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    const isValid = rfcPattern.test(rfc) && (rfc.length === 12 || rfc.length === 13);
    
    return {
      isValid,
      errors: isValid ? [] : ['Formato de RFC inválido']
    };
  }

  static validarCodigoPostal(cp: string): ValidationResult {
    const cpPattern = /^\d{5}$/;
    const isValid = cpPattern.test(cp);
    
    return {
      isValid,
      errors: isValid ? [] : ['Código postal debe tener 5 dígitos']
    };
  }

  static async validarCartaPorteCompleta(data: any): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Basic validations
    if (!data.rfcEmisor) {
      results.push({
        isValid: false,
        errors: ['RFC emisor es requerido']
      });
    }
    
    if (!data.rfcReceptor) {
      results.push({
        isValid: false,
        errors: ['RFC receptor es requerido']
      });
    }
    
    // If no errors, return success result
    if (results.length === 0) {
      results.push({
        isValid: true,
        errors: []
      });
    }
    
    return results;
  }
}
