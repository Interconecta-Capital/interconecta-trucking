
export class UUIDService {
  static generateValidIdCCP(): string {
    // Generar un UUID válido para IdCCP
    const uuid = crypto.randomUUID();
    return uuid.replace(/-/g, '').toUpperCase().substring(0, 36);
  }

  static validateIdCCP(idCCP: string): { isValid: boolean; error?: string } {
    if (!idCCP) {
      return { isValid: false, error: 'IdCCP es requerido' };
    }

    // Validar longitud (debe ser 36 caracteres sin guiones)
    if (idCCP.length !== 36) {
      return { isValid: false, error: 'IdCCP debe tener 36 caracteres' };
    }

    // Validar que solo contenga caracteres alfanuméricos
    if (!/^[A-F0-9]{36}$/i.test(idCCP)) {
      return { isValid: false, error: 'IdCCP debe contener solo caracteres alfanuméricos' };
    }

    return { isValid: true };
  }

  static formatIdCCPForDisplay(idCCP: string): string {
    if (!idCCP) return 'Sin generar';
    
    // Formatear como UUID estándar para mejor legibilidad
    if (idCCP.length === 36) {
      return [
        idCCP.substring(0, 8),
        idCCP.substring(8, 12),
        idCCP.substring(12, 16),
        idCCP.substring(16, 20),
        idCCP.substring(20, 36)
      ].join('-');
    }
    
    return idCCP;
  }
}
