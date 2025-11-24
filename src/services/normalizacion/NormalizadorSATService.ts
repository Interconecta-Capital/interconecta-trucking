/**
 * Servicio de Normalización de Nombres para Timbrado SAT
 * 
 * El SAT requiere nombres en formato específico:
 * - Mayúsculas
 * - Sin acentos
 * - Sin caracteres especiales
 * - Espacios simples
 */

export interface ResultadoNormalizacion {
  original: string;
  normalizado: string;
  cambios: string[];
}

export class NormalizadorSATService {
  
  /**
   * Normalizar nombre/razón social según especificaciones del SAT
   */
  static normalizarNombreParaTimbrado(razonSocial: string): string {
    if (!razonSocial) return '';
    
    return razonSocial
      .toUpperCase() // Mayúsculas
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^A-Z0-9\s&.,]/g, '') // Solo caracteres permitidos
      .replace(/\s+/g, ' ') // Múltiples espacios a uno
      .trim()
      .substring(0, 254); // Límite SAT
  }
  
  /**
   * Normalizar con detalles de los cambios realizados
   */
  static normalizarConDetalles(razonSocial: string): ResultadoNormalizacion {
    const original = razonSocial || '';
    const cambios: string[] = [];
    
    let resultado = original;
    
    // Detectar mayúsculas
    if (resultado !== resultado.toUpperCase()) {
      cambios.push('Convertido a mayúsculas');
      resultado = resultado.toUpperCase();
    }
    
    // Detectar acentos
    const sinAcentos = resultado.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (resultado !== sinAcentos) {
      cambios.push('Acentos removidos');
      resultado = sinAcentos;
    }
    
    // Detectar caracteres especiales
    const sinEspeciales = resultado.replace(/[^A-Z0-9\s&.,]/g, '');
    if (resultado !== sinEspeciales) {
      cambios.push('Caracteres especiales removidos');
      resultado = sinEspeciales;
    }
    
    // Detectar espacios múltiples
    const espaciosNormalizados = resultado.replace(/\s+/g, ' ').trim();
    if (resultado !== espaciosNormalizados) {
      cambios.push('Espacios normalizados');
      resultado = espaciosNormalizados;
    }
    
    // Límite de caracteres
    if (resultado.length > 254) {
      cambios.push('Truncado a 254 caracteres');
      resultado = resultado.substring(0, 254);
    }
    
    return {
      original,
      normalizado: resultado,
      cambios
    };
  }
  
  /**
   * Calcular similitud entre dos nombres (Levenshtein Distance)
   * Retorna valor entre 0 (totalmente diferente) y 1 (idénticos)
   */
  static calcularSimilitud(nombre1: string, nombre2: string): number {
    const n1 = this.normalizarNombreParaTimbrado(nombre1);
    const n2 = this.normalizarNombreParaTimbrado(nombre2);
    
    if (n1 === n2) return 1;
    if (!n1 || !n2) return 0;
    
    const distance = this.levenshteinDistance(n1, n2);
    const maxLength = Math.max(n1.length, n2.length);
    
    return 1 - (distance / maxLength);
  }
  
  /**
   * Algoritmo Levenshtein Distance
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];
    
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    return matrix[len1][len2];
  }
  
  /**
   * Sugerir corrección basada en comparación con nombre del SAT
   */
  static sugerirCorreccion(nombreIngresado: string, nombreSAT: string): {
    necesitaCorreccion: boolean;
    mensaje: string;
    similitud: number;
  } {
    const similitud = this.calcularSimilitud(nombreIngresado, nombreSAT);
    const nombreNormalizado = this.normalizarNombreParaTimbrado(nombreIngresado);
    const nombreSATNormalizado = this.normalizarNombreParaTimbrado(nombreSAT);
    
    if (nombreNormalizado === nombreSATNormalizado) {
      return {
        necesitaCorreccion: false,
        mensaje: 'El nombre coincide con el registrado en el SAT',
        similitud: 1
      };
    }
    
    if (similitud > 0.9) {
      return {
        necesitaCorreccion: true,
        mensaje: `El nombre es muy similar al del SAT. Se usará: "${nombreSAT}"`,
        similitud
      };
    }
    
    if (similitud > 0.7) {
      return {
        necesitaCorreccion: true,
        mensaje: `El nombre difiere del SAT. Se usará el nombre oficial: "${nombreSAT}"`,
        similitud
      };
    }
    
    return {
      necesitaCorreccion: true,
      mensaje: `⚠️ El nombre ingresado ("${nombreIngresado}") es muy diferente del registrado en el SAT ("${nombreSAT}"). Verifica el RFC.`,
      similitud
    };
  }
  
  /**
   * Validar que un nombre esté en formato correcto del SAT
   */
  static validarFormatoSAT(nombre: string): {
    valido: boolean;
    errores: string[];
  } {
    const errores: string[] = [];
    
    if (!nombre || nombre.trim().length === 0) {
      errores.push('El nombre no puede estar vacío');
    }
    
    if (nombre.length > 254) {
      errores.push('El nombre excede 254 caracteres');
    }
    
    if (nombre !== nombre.toUpperCase()) {
      errores.push('El nombre debe estar en mayúsculas');
    }
    
    if (/[àèìòùáéíóúäëïöüâêîôû]/i.test(nombre)) {
      errores.push('El nombre no debe contener acentos');
    }
    
    if (/[^A-Z0-9\s&.,]/i.test(nombre)) {
      errores.push('El nombre contiene caracteres no permitidos');
    }
    
    if (/\s{2,}/.test(nombre)) {
      errores.push('El nombre contiene espacios múltiples');
    }
    
    return {
      valido: errores.length === 0,
      errores
    };
  }
}
