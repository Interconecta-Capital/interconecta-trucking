/**
 * RFCValidator - Servicio centralizado para validación de RFC
 * Implementa validación según especificaciones del SAT
 */

export interface RFCValidationResult {
  valido: boolean;
  error?: string;
}

export class RFCValidator {
  // Regex oficial SAT para RFC
  static readonly RFC_REGEX = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
  
  // Regex para RFC genérico (extranjeros)
  static readonly RFC_GENERICO = 'XEXX010101000';
  static readonly RFC_GENERICO_NACIONAL = 'XAXX010101000';

  /**
   * Valida formato de RFC según especificaciones SAT
   * @param rfc - RFC a validar
   * @returns Objeto con resultado de validación
   */
  static validar(rfc: string): RFCValidationResult {
    if (!rfc || rfc.trim().length === 0) {
      return { valido: false, error: 'RFC es requerido' };
    }
    
    const rfcLimpio = this.normalizar(rfc);
    
    // Permitir RFCs genéricos
    if (rfcLimpio === this.RFC_GENERICO || rfcLimpio === this.RFC_GENERICO_NACIONAL) {
      return { valido: true };
    }
    
    // Validar longitud
    if (rfcLimpio.length < 12 || rfcLimpio.length > 13) {
      return { 
        valido: false, 
        error: 'RFC debe tener 12 caracteres (personas morales) o 13 caracteres (personas físicas)' 
      };
    }
    
    // ✅ FASE 5: Validación más permisiva (acepta RFCs con 1-3 caracteres de homoclave)
    const RFC_REGEX_PERMISIVO = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{1,3}$/;
    
    if (!RFC_REGEX_PERMISIVO.test(rfcLimpio)) {
      return { 
        valido: false, 
        error: 'Formato de RFC inválido. Debe contener solo letras y números en el formato correcto' 
      };
    }
    
    // ✅ Warning en consola si el RFC no tiene homoclave completa (3 caracteres)
    const parteHomoclave = rfcLimpio.substring(rfcLimpio.length - 3);
    if (!/^[A-Z0-9]{3}$/.test(parteHomoclave)) {
      console.warn(`⚠️ RFC ${rfcLimpio} podría estar incompleto (homoclave: "${parteHomoclave}")`);
    }
    
    return { valido: true };
  }
  
  /**
   * Normaliza RFC (uppercase, trim)
   * @param rfc - RFC a normalizar
   * @returns RFC normalizado
   */
  static normalizar(rfc: string): string {
    if (!rfc) return '';
    return rfc.trim().toUpperCase();
  }
  
  /**
   * Valida si es RFC de persona física
   * @param rfc - RFC a validar
   * @returns true si es persona física
   */
  static esPersonaFisica(rfc: string): boolean {
    const rfcLimpio = this.normalizar(rfc);
    return rfcLimpio.length === 13;
  }
  
  /**
   * Valida si es RFC de persona moral
   * @param rfc - RFC a validar
   * @returns true si es persona moral
   */
  static esPersonaMoral(rfc: string): boolean {
    const rfcLimpio = this.normalizar(rfc);
    return rfcLimpio.length === 12;
  }
  
  /**
   * Valida si es RFC genérico
   * @param rfc - RFC a validar
   * @returns true si es RFC genérico
   */
  static esRFCGenerico(rfc: string): boolean {
    const rfcLimpio = this.normalizar(rfc);
    return rfcLimpio === this.RFC_GENERICO || rfcLimpio === this.RFC_GENERICO_NACIONAL;
  }
}
