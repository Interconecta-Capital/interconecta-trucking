
import { CartaPorteData } from '@/types/cartaPorte';
import { CartaPortePDFTemplate } from './CartaPortePDFTemplate';

export interface PDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfUrl?: string;
  error?: string;
}

export class CartaPortePDFAdvanced {
  static async generarPDF(data: CartaPorteData): Promise<PDFGenerationResult> {
    try {
      console.log('🔄 Iniciando generación de PDF mejorado...');
      
      const template = new CartaPortePDFTemplate();
      const pdfBlob = template.generatePDF(data);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      console.log('✅ PDF generado exitosamente');
      
      return {
        success: true,
        pdfBlob,
        pdfUrl
      };
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  static descargarPDF(pdfBlob: Blob, filename: string = 'carta-porte.pdf') {
    try {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ PDF descargado:', filename);
    } catch (error) {
      console.error('❌ Error descargando PDF:', error);
      throw error;
    }
  }

  static async previsualizarPDF(pdfBlob: Blob): Promise<string> {
    return URL.createObjectURL(pdfBlob);
  }
}
