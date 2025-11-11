export interface DocumentValidationRules {
  maxSize: number; // en MB
  allowedTypes: string[];
  requiresEncryption: boolean;
  bucket: string;
}

export const DOCUMENT_RULES: Record<string, DocumentValidationRules> = {
  'conductor_license_photo': {
    maxSize: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    requiresEncryption: true,
    bucket: 'conductores-docs'
  },
  'conductor_documents': {
    maxSize: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    requiresEncryption: true,
    bucket: 'conductores-docs'
  },
  'vehiculo_tarjeta_circulacion': {
    maxSize: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    requiresEncryption: true,
    bucket: 'vehiculos-docs'
  },
  'vehiculo_poliza_seguro': {
    maxSize: 10,
    allowedTypes: ['application/pdf'],
    requiresEncryption: true,
    bucket: 'vehiculos-docs'
  },
  'vehiculo_verificacion': {
    maxSize: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    requiresEncryption: true,
    bucket: 'vehiculos-docs'
  },
  'remolque_tarjeta': {
    maxSize: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    requiresEncryption: true,
    bucket: 'remolques-docs'
  },
  'remolque_permiso_sct': {
    maxSize: 10,
    allowedTypes: ['application/pdf'],
    requiresEncryption: true,
    bucket: 'remolques-docs'
  },
  'socio_constancia_fiscal': {
    maxSize: 5,
    allowedTypes: ['application/pdf'],
    requiresEncryption: true,
    bucket: 'socios-docs'
  },
  'socio_identificacion': {
    maxSize: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    requiresEncryption: true,
    bucket: 'socios-docs'
  },
  'certificado_digital': {
    maxSize: 5,
    allowedTypes: ['application/x-x509-ca-cert', 'application/octet-stream'],
    requiresEncryption: false,
    bucket: 'certificados'
  },
  'carta_porte_pdf': {
    maxSize: 5,
    allowedTypes: ['application/pdf', 'application/xml', 'text/xml'],
    requiresEncryption: false,
    bucket: 'cartas-porte'
  }
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export class DocumentValidationService {
  /**
   * Valida un archivo según el tipo de documento
   */
  static validateFile(file: File, documentType: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const rules = DOCUMENT_RULES[documentType];

    if (!rules) {
      errors.push(`Tipo de documento no reconocido: ${documentType}`);
      return { valid: false, errors };
    }

    // Validar tamaño
    const maxSizeBytes = rules.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`El archivo excede el tamaño máximo de ${rules.maxSize}MB`);
    }

    // Validar tipo MIME
    if (!rules.allowedTypes.includes(file.type)) {
      errors.push(
        `Tipo de archivo no permitido. Tipos aceptados: ${rules.allowedTypes.map(t => t.split('/')[1]).join(', ')}`
      );
    }

    // Validar nombre de archivo (seguridad)
    if (this.hasInsecureFilename(file.name)) {
      errors.push('Nombre de archivo contiene caracteres no seguros o extensiones peligrosas');
    }

    // Validar tamaño mínimo (evitar archivos vacíos)
    if (file.size < 100) {
      warnings.push('El archivo parece estar vacío o demasiado pequeño');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Valida múltiples archivos
   */
  static validateFiles(files: File[], documentType: string): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    files.forEach((file, index) => {
      const result = this.validateFile(file, documentType);
      if (!result.valid) {
        allErrors.push(`Archivo ${index + 1} (${file.name}): ${result.errors.join(', ')}`);
      }
      if (result.warnings && result.warnings.length > 0) {
        allWarnings.push(`Archivo ${index + 1} (${file.name}): ${result.warnings.join(', ')}`);
      }
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : undefined
    };
  }

  /**
   * Detecta nombres de archivo inseguros
   */
  private static hasInsecureFilename(filename: string): boolean {
    const insecurePatterns = [
      /\.\./,  // Path traversal
      /[<>:"|?*]/,  // Caracteres especiales peligrosos
      /\.exe$|\.bat$|\.cmd$|\.sh$|\.com$|\.scr$/i,  // Extensiones ejecutables
      /^\.ht/,  // Archivos .htaccess, .htpasswd
      /\.php$|\.asp$|\.jsp$/i  // Scripts de servidor
    ];

    return insecurePatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Obtiene las reglas de validación para un tipo de documento
   */
  static getRules(documentType: string): DocumentValidationRules | null {
    return DOCUMENT_RULES[documentType] || null;
  }

  /**
   * Formatea el tamaño de archivo a formato legible
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Genera un nombre de archivo seguro
   */
  static sanitizeFilename(filename: string): string {
    // Eliminar caracteres peligrosos
    let sanitized = filename.replace(/[<>:"|?*]/g, '_');
    
    // Eliminar path traversal
    sanitized = sanitized.replace(/\.\./g, '');
    
    // Limitar longitud
    const maxLength = 200;
    if (sanitized.length > maxLength) {
      const ext = sanitized.split('.').pop();
      const name = sanitized.substring(0, maxLength - (ext ? ext.length + 1 : 0));
      sanitized = ext ? `${name}.${ext}` : name;
    }
    
    return sanitized;
  }
}
