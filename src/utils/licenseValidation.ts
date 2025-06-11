
export interface LicenseValidationResult {
  esValida: boolean;
  errores: string[];
}

export class LicenseValidator {
  // Validar licencia de conducir mexicana
  static validarLicencia(licencia: string, tipoFigura: string): LicenseValidationResult {
    if (tipoFigura === '01' && !licencia) { // Operador requiere licencia
      return {
        esValida: false,
        errores: ['La licencia de conducir es requerida para operadores']
      };
    }

    if (!licencia) {
      return {
        esValida: true,
        errores: []
      };
    }

    const licenciaNormalizada = licencia.trim().toUpperCase().replace(/\s+/g, '');
    const errores: string[] = [];

    // Longitud mínima y máxima
    if (licenciaNormalizada.length < 8) {
      errores.push('La licencia debe tener al menos 8 caracteres');
    }

    if (licenciaNormalizada.length > 20) {
      errores.push('La licencia no puede tener más de 20 caracteres');
    }

    // Formato básico: puede contener letras, números y algunos caracteres especiales
    if (!/^[A-Z0-9\-_.]+$/.test(licenciaNormalizada)) {
      errores.push('La licencia solo puede contener letras, números, guiones, puntos y guiones bajos');
    }

    // No puede ser todo números o todo letras
    if (/^[0-9]+$/.test(licenciaNormalizada)) {
      errores.push('La licencia no puede contener solo números');
    }

    if (/^[A-Z]+$/.test(licenciaNormalizada)) {
      errores.push('La licencia no puede contener solo letras');
    }

    return {
      esValida: errores.length === 0,
      errores
    };
  }

  // Formatear licencia
  static formatearLicencia(licencia: string): string {
    return licencia.trim().toUpperCase().replace(/\s+/g, '');
  }

  // Validar que el tipo de licencia sea compatible con el tipo de vehículo
  static validarCompatibilidadLicencia(
    tipoLicencia: string, 
    configVehicular: string
  ): LicenseValidationResult {
    const errores: string[] = [];

    // Mapeo básico de configuraciones que requieren licencia especial
    const configuracionesEspeciales = [
      'C2', 'C3', 'T2S1', 'T2S2', 'T2S3', 'T3S1', 'T3S2', 'T3S3'
    ];

    if (configuracionesEspeciales.includes(configVehicular)) {
      if (!tipoLicencia || tipoLicencia === 'A') {
        errores.push('Esta configuración vehicular requiere licencia tipo B o superior');
      }
    }

    return {
      esValida: errores.length === 0,
      errores
    };
  }
}
