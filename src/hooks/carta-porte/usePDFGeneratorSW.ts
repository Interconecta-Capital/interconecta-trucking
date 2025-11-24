import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeneratePDFOptions {
  cartaPorteId?: string;
  facturaId?: string;
  uuid?: string;
  ambiente?: 'sandbox' | 'production';
}

export function usePDFGeneratorSW() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generatePDF = async (options: GeneratePDFOptions) => {
    setIsGenerating(true);
    try {
      console.log('📄 Generando PDF con SmartWeb...', options);

      const { data, error } = await supabase.functions.invoke('generar-pdf-cfdi', {
        body: {
          cartaPorteId: options.cartaPorteId,
          facturaId: options.facturaId,
          uuid: options.uuid,
          ambiente: options.ambiente || 'sandbox'
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error generando PDF');
      }

      console.log('✅ PDF generado exitosamente:', data.pdfUrl);
      setPdfUrl(data.pdfUrl);
      toast.success('PDF generado correctamente');

      return {
        success: true,
        pdfUrl: data.pdfUrl,
        pdfBase64: data.pdfBase64
      };

    } catch (error: any) {
      console.error('❌ Error generando PDF:', error);
      toast.error(error.message || 'Error al generar PDF');
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = (url?: string) => {
    const downloadUrl = url || pdfUrl;
    if (!downloadUrl) {
      toast.error('No hay PDF disponible para descargar');
      return;
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `CFDI_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('PDF descargado');
  };

  const clearPDF = () => {
    setPdfUrl(null);
  };

  return {
    isGenerating,
    pdfUrl,
    generatePDF,
    downloadPDF,
    clearPDF
  };
}
