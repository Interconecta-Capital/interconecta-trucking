
export interface RFCValidationResult {
  esValido: boolean;
  errores: string[];
  tipo?: 'fisica' | 'moral' | null;
}

export class RFCValidator {
  static validarRFC(rfc: string): RFCValidationResult {
    const result: RFCValidationResult = {
      esValido: false,
      errores: [],
      tipo: null
    };

    // Limpiar el RFC (quitar espacios y convertir a mayúsculas)
    const rfcLimpio = rfc.trim().toUpperCase();

    // Validación de longitud
    if (rfcLimpio.length < 12 || rfcLimpio.length > 13) {
      result.errores.push('El RFC debe tener 12 o 13 caracteres');
      return result;
    }

    // Determinar tipo de persona basado en longitud
    const esPersonaFisica = rfcLimpio.length === 13;
    const esPersonaMoral = rfcLimpio.length === 12;

    result.tipo = esPersonaFisica ? 'fisica' : 'moral';

    // Patrones de validación
    const patronPersonaFisica = /^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$/;
    const patronPersonaMoral = /^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/;

    // Validar formato según el tipo
    if (esPersonaFisica && !patronPersonaFisica.test(rfcLimpio)) {
      result.errores.push('Formato inválido para persona física');
      return result;
    }

    if (esPersonaMoral && !patronPersonaMoral.test(rfcLimpio)) {
      result.errores.push('Formato inválido para persona moral');
      return result;
    }

    // Validaciones adicionales
    const fechaParte = rfcLimpio.substring(rfcLimpio.length - 9, rfcLimpio.length - 3);
    const año = parseInt(fechaParte.substring(0, 2));
    const mes = parseInt(fechaParte.substring(2, 4));
    const dia = parseInt(fechaParte.substring(4, 6));

    // Validar mes
    if (mes < 1 || mes > 12) {
      result.errores.push('Mes inválido en la fecha de nacimiento/constitución');
      return result;
    }

    // Validar día
    if (dia < 1 || dia > 31) {
      result.errores.push('Día inválido en la fecha de nacimiento/constitución');
      return result;
    }

    // Validar palabras inconvenientes (lista básica)
    const palabrasInconvenientes = [
      'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA', 'CAKO',
      'COGE', 'COGI', 'COJA', 'COJE', 'COJI', 'COJO', 'COLA', 'CULO',
      'FALO', 'FETO', 'GETA', 'GUEI', 'GUEY', 'JETA', 'JOTO', 'KACA',
      'KACO', 'KAGA', 'KAGO', 'KAKA', 'KAKO', 'KOGE', 'KOGI', 'KOJA',
      'KOJE', 'KOJI', 'KOJO', 'KOLA', 'KULO', 'LILO', 'LOCA', 'LOCO',
      'LOKA', 'LOKO', 'MAME', 'MAMO', 'MEAR', 'MEAS', 'MEON', 'MIAR',
      'MION', 'MOCO', 'MOKO', 'MULA', 'MULO', 'NACA', 'NACO', 'PEDA',
      'PEDO', 'PENE', 'PIPI', 'PITO', 'POPO', 'PUTA', 'PUTO', 'QULO',
      'RATA', 'ROBA', 'ROBE', 'ROBO', 'RUIN', 'SENO', 'TETA', 'VACA',
      'VAGA', 'VAGO', 'VAKA', 'VUEI', 'VUEY', 'WUEI', 'WUEY'
    ];

    const inicialesRFC = esPersonaFisica 
      ? rfcLimpio.substring(0, 4)
      : rfcLimpio.substring(0, 3);

    if (palabrasInconvenientes.includes(inicialesRFC)) {
      result.errores.push('El RFC contiene una combinación no permitida');
      return result;
    }

    // Si llegamos aquí, el RFC es válido
    result.esValido = true;
    return result;
  }

  static formatearRFC(rfc: string): string {
    return rfc.trim().toUpperCase();
  }

  static esRFCGenerico(rfc: string): boolean {
    const rfcLimpio = rfc.trim().toUpperCase();
    const rfcsGenericos = [
      'XAXX010101000', 'XEXX010101000', 'AAA010101AAA'
    ];
    return rfcsGenericos.includes(rfcLimpio);
  }
}
