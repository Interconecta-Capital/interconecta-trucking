
export interface RFCValidationResult {
  esValido: boolean;
  mensaje?: string;
  errores?: string[];
  tipo?: 'fisica' | 'moral';
}

export class RFCValidator {
  private static readonly RFC_PATTERN = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
  
  static validarRFC(rfc: string): RFCValidationResult {
    if (!rfc || rfc.trim() === '') {
      return {
        esValido: false,
        mensaje: 'RFC es requerido',
        errores: ['RFC es requerido']
      };
    }

    const rfcLimpio = rfc.trim().toUpperCase();
    
    if (!this.RFC_PATTERN.test(rfcLimpio)) {
      return {
        esValido: false,
        mensaje: 'Formato de RFC inválido',
        errores: ['El RFC debe tener el formato correcto (ej: XAXX010101000)']
      };
    }

    // Detectar tipo de persona basado en la longitud
    const tipo = rfcLimpio.length === 12 ? 'fisica' : 'moral';

    // Validar dígito verificador con algoritmo corregido
    if (!this.validarDigitoVerificador(rfcLimpio)) {
      return {
        esValido: false,
        mensaje: 'Dígito verificador inválido',
        errores: ['El dígito verificador del RFC no es correcto'],
        tipo
      };
    }

    return {
      esValido: true,
      mensaje: 'RFC válido',
      tipo
    };
  }

  private static validarDigitoVerificador(rfc: string): boolean {
    // Implementación corregida del algoritmo de validación del RFC
    const valores = {
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18,
      'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, '&': 24, 'O': 25, 'P': 26, 'Q': 27,
      'R': 28, 'S': 29, 'T': 30, 'U': 31, 'V': 32, 'W': 33, 'X': 34, 'Y': 35, 'Z': 36, 'Ñ': 37
    };

    let suma = 0;
    const rfcSinDigito = rfc.slice(0, -1);
    
    for (let i = 0; i < rfcSinDigito.length; i++) {
      const caracter = rfcSinDigito[i];
      const valor = valores[caracter as keyof typeof valores];
      if (valor === undefined) return false;
      suma += valor * (rfcSinDigito.length - i);
    }

    const residuo = suma % 11;
    let digitoCalculado: string | number = 11 - residuo;
    
    if (digitoCalculado === 11) digitoCalculado = '0';
    if (digitoCalculado === 10) digitoCalculado = 'A';

    const digitoEsperado = rfc.slice(-1);
    return digitoCalculado.toString() === digitoEsperado;
  }

  // Función para validar RFCs comunes de prueba
  static esRFCGenerico(rfc: string): boolean {
    const rfcsGenericos = ['XAXX010101000', 'XEXX010101000'];
    return rfcsGenericos.includes(rfc.trim().toUpperCase());
  }

  // Función para sugerir corrección
  static sugerirCorreccion(rfc: string): string | null {
    if (!rfc || rfc.trim() === '') return null;
    
    const rfcLimpio = rfc.trim().toUpperCase();
    
    // Si es muy corto, sugerir completar
    if (rfcLimpio.length < 12) {
      return 'El RFC debe tener al menos 12 caracteres para persona física o 12 para persona moral';
    }
    
    // Si es muy largo, sugerir recortar
    if (rfcLimpio.length > 13) {
      return 'El RFC no debe tener más de 13 caracteres';
    }
    
    return null;
  }
}
