export interface CartaPortePDFResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfUrl?: string;
  uuid?: string;
  selloDigital?: string;
  cadenaOriginal?: string;
  qrCode?: string;
  error?: string;
}

import { supabase } from '@/integrations/supabase/client';

export class CartaPortePDFService {
  private static readonly GENERATE_ENDPOINT = 'generar-pdf-carta-porte';

  static async generate(id: string): Promise<CartaPortePDFResult> {
    try {
      const { data, error } = await supabase.functions.invoke(this.GENERATE_ENDPOINT, {
        body: { id }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || (!data.pdfBase64 && !data.pdfUrl)) {
        return { success: false, error: 'PDF no generado' };
      }

      let pdfBlob: Blob | undefined;
      let pdfUrl: string | undefined = data.pdfUrl;

      if (data.pdfBase64) {
        const byteCharacters = atob(data.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        pdfBlob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
        pdfUrl = URL.createObjectURL(pdfBlob);
      }

      return {
        success: true,
        pdfBlob,
        pdfUrl,
        uuid: data.uuid,
        selloDigital: data.selloDigital,
        cadenaOriginal: data.cadenaOriginal,
        qrCode: data.qrCode
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido generando PDF';
      return { success: false, error: message };
    }
  }
}
