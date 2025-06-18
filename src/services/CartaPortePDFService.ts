export interface CartaPortePDFResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfUrl?: string;
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

      if (!data || !data.pdfBase64) {
        return { success: false, error: 'PDF no generado' };
      }

      const byteCharacters = atob(data.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
      const pdfBlob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      return { success: true, pdfBlob, pdfUrl };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido generando PDF';
      return { success: false, error: message };
    }
  }
}
