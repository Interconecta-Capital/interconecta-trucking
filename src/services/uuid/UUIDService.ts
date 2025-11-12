
export class UUIDService {
  static generateValidIdCCP(): string {
    // FASE 4: Generar IdCCP válido para SAT v3.1
    // Formato: 32 caracteres alfanuméricos en mayúsculas (UUID sin guiones)
    const uuidOriginal = crypto.randomUUID(); // Ej: "550e8400-e29b-41d4-a716-446655440000"
    const idCCP = uuidOriginal.replace(/-/g, '').toUpperCase(); // "550E8400E29B41D4A716446655440000"
    
    // ✅ FASE 6: Logging detallado para debugging
    console.log('🆔 [UUID] Generado:', {
      original: uuidOriginal,
      sin_guiones: idCCP,
      length: idCCP.length,
      es_valido: idCCP.length === 32
    });
    
    // Validar longitud
    if (idCCP.length !== 32) {
      console.error('❌ [UUID] Error: longitud incorrecta:', idCCP.length);
    }
    
    return idCCP; // Retorna exactamente 32 caracteres
  }

  static validateIdCCP(idCCP: string): { isValid: boolean; error?: string } {
    if (!idCCP) {
      return { isValid: false, error: 'IdCCP es requerido' };
    }

    // FASE 4: Validar longitud (debe ser 32 caracteres sin guiones para SAT v3.1)
    if (idCCP.length !== 32) {
      return { isValid: false, error: 'IdCCP debe tener 32 caracteres (UUID sin guiones)' };
    }

    // Validar que solo contenga caracteres alfanuméricos en mayúsculas
    if (!/^[A-F0-9]{32}$/i.test(idCCP)) {
      return { isValid: false, error: 'IdCCP debe contener solo caracteres alfanuméricos (A-F, 0-9)' };
    }

    return { isValid: true };
  }

  static formatIdCCPForDisplay(idCCP: string): string {
    if (!idCCP) return 'Sin generar';
    
    // FASE 4: Formatear IdCCP de 32 caracteres como UUID para mejor legibilidad
    if (idCCP.length === 32) {
      // Convertir "550E8400E29B41D4A716446655440000" a "550E8400-E29B-41D4-A716-446655440000"
      return [
        idCCP.substring(0, 8),
        idCCP.substring(8, 12),
        idCCP.substring(12, 16),
        idCCP.substring(16, 20),
        idCCP.substring(20, 32)
      ].join('-');
    }
    
    // Si es formato legacy (36 chars), devolver tal cual
    return idCCP;
  }
}
