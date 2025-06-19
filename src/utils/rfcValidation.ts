
export class RFCValidator {
  private static readonly RFC_REGEX_FISICA = /^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/;
  private static readonly RFC_REGEX_MORAL = /^[A-Z&Ñ]{3}[0-9]{6}[A-Z0-9]{3}$/;

  static validarRFC(rfc: string): { esValido: boolean; mensaje: string; tipo?: 'fisica' | 'moral' } {
    if (!rfc) {
      return { esValido: false, mensaje: 'RFC requerido' };
    }

    const rfcLimpio = rfc.replace(/\s/g, '').toUpperCase();

    if (rfcLimpio.length < 12 || rfcLimpio.length > 13) {
      return { esValido: false, mensaje: 'RFC debe tener 12 o 13 caracteres' };
    }

    // Verificar si es persona física (13 caracteres)
    if (rfcLimpio.length === 13 && this.RFC_REGEX_FISICA.test(rfcLimpio)) {
      return { esValido: true, mensaje: 'RFC válido', tipo: 'fisica' };
    }

    // Verificar si es persona moral (12 caracteres)
    if (rfcLimpio.length === 12 && this.RFC_REGEX_MORAL.test(rfcLimpio)) {
      return { esValido: true, mensaje: 'RFC válido', tipo: 'moral' };
    }

    return { esValido: false, mensaje: 'Formato de RFC inválido' };
  }

  static formatearRFC(rfc: string): string {
    if (!rfc) return '';
    return rfc.replace(/\s/g, '').toUpperCase();
  }

  static esRFCGenerico(rfc: string): boolean {
    const rfcLimpio = this.formatearRFC(rfc);
    const genericos = ['XAXX010101000', 'XEXX010101000'];
    return genericos.includes(rfcLimpio);
  }
}
