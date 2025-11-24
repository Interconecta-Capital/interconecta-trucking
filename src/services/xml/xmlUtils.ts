
import { CartaPorteData } from '@/types/cartaPorte';

export class XMLUtils {
  static generarFolio(): string {
    return Date.now().toString();
  }

  static obtenerCodigoPostalExpedicion(data: CartaPorteData): string {
    return data.ubicaciones?.[0]?.domicilio?.codigo_postal || '00000';
  }

  static formatearFecha(fecha: string | Date): string {
    if (!fecha) return '';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    
    // Formato SAT: YYYY-MM-DDTHH:MM:SS (sin milisegundos ni zona horaria)
    const year = fechaObj.getFullYear();
    const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const day = String(fechaObj.getDate()).padStart(2, '0');
    const hours = String(fechaObj.getHours()).padStart(2, '0');
    const minutes = String(fechaObj.getMinutes()).padStart(2, '0');
    const seconds = String(fechaObj.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  static escaparXML(texto: string): string {
    if (!texto) return '';
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  static validarRFC(rfc: string): boolean {
    if (!rfc) return false;
    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{3}$/;
    return rfcPattern.test(rfc.toUpperCase());
  }

  static validarCURP(curp: string): boolean {
    if (!curp) return false;
    const curpPattern = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/;
    return curpPattern.test(curp.toUpperCase());
  }
}
