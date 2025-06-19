
export interface RFCValidationResult {
  esValido: boolean;
  tipo?: 'fisica' | 'moral';
  errores: string[];
}

export class RFCValidator {
  // Expresiones regulares para validar RFC
  private static readonly RFC_FISICA_REGEX = /^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$/;
  private static readonly RFC_MORAL_REGEX = /^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/;
  private static readonly RFC_GENERICO = 'XAXX010101000';
  private static readonly RFC_EXTRANJERO = 'XEXX010101000';

  // Palabras inconvenientes que no pueden aparecer en RFC
  private static readonly PALABRAS_INCONVENIENTES = [
    'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA', 'CAKO', 'COGE', 'COGI', 'COJA', 'COJE', 'COJI', 'COJO',
    'COLA', 'CULO', 'FALO', 'FETO', 'GETA', 'GUEY', 'JETA', 'JOTO', 'KACA', 'KACO', 'KAGA', 'KAGO', 'KAKA', 'KAKO',
    'KOGE', 'KOGI', 'KOJA', 'KOJE', 'KOJI', 'KOJO', 'KOLA', 'KULO', 'LILO', 'LOCA', 'LOCO', 'LOKA', 'LOKO', 'MAME',
    'MAMO', 'MEAR', 'MEAS', 'MEON', 'MIAR', 'MION', 'MOCO', 'MOKO', 'MULA', 'MULO', 'NACA', 'NACO', 'PEDA', 'PEDO',
    'PENE', 'PIPI', 'PITO', 'POPO', 'PUTA', 'PUTO', 'QULO', 'RATA', 'ROBA', 'ROBE', 'ROBO', 'RUIN', 'SENO', 'TETA',
    'VACA', 'VAGA', 'VAGO', 'VAKA', 'VUEI', 'VUEY', 'WUEI', 'WUEY'
  ];

  static validarRFC(rfc: string): RFCValidationResult {
    if (!rfc) {
      return {
        esValido: false,
        errores: ['El RFC es requerido']
      };
    }

    // Normalizar RFC (mayúsculas, sin espacios)
    const rfcNormalizado = rfc.trim().toUpperCase();

    // Casos especiales válidos
    if (rfcNormalizado === this.RFC_GENERICO || rfcNormalizado === this.RFC_EXTRANJERO) {
      return {
        esValido: true,
        tipo: 'moral',
        errores: []
      };
    }

    const errores: string[] = [];

    // Validar longitud
    if (rfcNormalizado.length !== 12 && rfcNormalizado.length !== 13) {
      errores.push('El RFC debe tener 12 o 13 caracteres');
    }

    // Determinar tipo y validar formato
    let tipo: 'fisica' | 'moral' | undefined;
    
    if (rfcNormalizado.length === 13) {
      tipo = 'fisica';
      if (!this.RFC_FISICA_REGEX.test(rfcNormalizado)) {
        errores.push('Formato de RFC de persona física no válido');
      }
    } else if (rfcNormalizado.length === 12) {
      tipo = 'moral';
      if (!this.RFC_MORAL_REGEX.test(rfcNormalizado)) {
        errores.push('Formato de RFC de persona moral no válido');
      }
    }

    // Validar palabras inconvenientes
    const iniciales = rfcNormalizado.substring(0, tipo === 'fisica' ? 4 : 3);
    if (this.PALABRAS_INCONVENIENTES.includes(iniciales)) {
      errores.push('El RFC contiene una combinación de caracteres no permitida');
    }

    // Validar fecha de nacimiento/constitución
    if (tipo) {
      const fechaStr = rfcNormalizado.substring(tipo === 'fisica' ? 4 : 3, tipo === 'fisica' ? 10 : 9);
      if (!this.validarFechaRFC(fechaStr)) {
        errores.push('La fecha en el RFC no es válida');
      }
    }

    // Validar homoclave
    const homoclave = rfcNormalizado.substring(rfcNormalizado.length - 3);
    if (!/^[A-Z0-9]{3}$/.test(homoclave)) {
      errores.push('La homoclave del RFC no es válida');
    }

    return {
      esValido: errores.length === 0,
      tipo,
      errores
    };
  }

  private static validarFechaRFC(fechaStr: string): boolean {
    if (fechaStr.length !== 6) return false;

    const año = parseInt(fechaStr.substring(0, 2), 10);
    const mes = parseInt(fechaStr.substring(2, 4), 10);
    const dia = parseInt(fechaStr.substring(4, 6), 10);

    // Validar rangos básicos
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;

    // Convertir año de 2 dígitos a 4 dígitos
    const añoCompleto = año <= 30 ? 2000 + año : 1900 + año;

    // Crear fecha y validar
    const fecha = new Date(añoCompleto, mes - 1, dia);
    return fecha.getFullYear() === añoCompleto &&
           fecha.getMonth() === mes - 1 &&
           fecha.getDate() === dia;
  }

  static formatearRFC(rfc: string): string {
    return rfc.trim().toUpperCase();
  }

  static esRFCGenerico(rfc: string): boolean {
    const rfcNormalizado = rfc.trim().toUpperCase();
    return rfcNormalizado === this.RFC_GENERICO || rfcNormalizado === this.RFC_EXTRANJERO;
  }
}
