/**
 * Utilidades de formateo según especificaciones del SAT
 */

export class SATFormatters {
  /**
   * Formatea fecha según especificación del SAT para CFDI 4.0
   * Formato: YYYY-MM-DDTHH:MM:SS (sin milisegundos ni zona horaria)
   * Ejemplo: 2025-11-24T14:30:15
   */
  static formatFechaCFDI(fecha: Date = new Date()): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * Formatea valores monetarios (2 decimales)
   */
  static formatMonetario(valor: number): string {
    return valor.toFixed(2);
  }

  /**
   * Formatea valores de tasa o cuota (6 decimales)
   */
  static formatTasaOCuota(valor: number): string {
    return valor.toFixed(6);
  }

  /**
   * Valida RFC según especificación SAT
   */
  static validarRFC(rfc: string): boolean {
    if (!rfc) return false;
    const rfcPattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
    return rfcPattern.test(rfc.toUpperCase());
  }

  /**
   * Valida código postal mexicano
   */
  static validarCodigoPostal(cp: string): boolean {
    return /^\d{5}$/.test(cp);
  }

  /**
   * Escapa caracteres especiales XML
   */
  static escaparXML(texto: string): string {
    if (!texto) return '';
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
