
/**
 * Servicio para generación y validación de UUID v4 según RFC 4122
 * Usado específicamente para generar IdCCP de Carta Porte 3.1
 */
export class UUIDService {
  
  /**
   * Genera un UUID v4 válido de 36 caracteres según RFC 4122
   * Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   */
  static generateIdCCP(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Valida que un UUID tenga el formato correcto para IdCCP
   * Debe tener exactamente 36 caracteres según RFC 4122
   */
  static validateIdCCP(uuid: string): { isValid: boolean; error?: string } {
    if (!uuid) {
      return { isValid: false, error: 'UUID no puede estar vacío' };
    }

    if (uuid.length !== 36) {
      return { isValid: false, error: 'UUID debe tener exactamente 36 caracteres' };
    }

    // Validar formato RFC 4122
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      return { isValid: false, error: 'UUID no tiene formato RFC 4122 válido' };
    }

    return { isValid: true };
  }

  /**
   * Genera un nuevo IdCCP y lo valida antes de retornarlo
   */
  static generateValidIdCCP(): string {
    const uuid = this.generateIdCCP();
    const validation = this.validateIdCCP(uuid);
    
    if (!validation.isValid) {
      // Si falla la validación, intentar generar uno nuevo
      console.warn('UUID generado no pasó validación, regenerando...', validation.error);
      return this.generateValidIdCCP();
    }
    
    return uuid;
  }

  /**
   * Formatea un UUID para mostrar en la interfaz de usuario
   */
  static formatIdCCPForDisplay(uuid: string): string {
    if (!uuid) return 'No generado';
    
    const validation = this.validateIdCCP(uuid);
    if (!validation.isValid) {
      return `Inválido: ${uuid}`;
    }
    
    return uuid.toUpperCase();
  }
}
